import { Component, Match, Show, Switch, createResource, lazy } from 'solid-js';
import { useApi } from '../contexts/ApiProvider';
import { useParams, useSearchParams } from '@solidjs/router';
import { Book, Breadcrumb, Note } from '../core/types';
import NoteBreadcrumb from '../components/note/breadcrumb';
import { FiFilePlus, FiFolderPlus, FiSettings } from 'solid-icons/fi';
import { useModal } from '../contexts/ModalProvider';
import { useCurrentUser } from '../contexts/CurrentUserProvider';
import NewBookModal from '../components/modals/new_book';
import NewNoteModal from '../components/modals/new_note';
import UpdateBookModal from '../components/modals/edit_book';
import UpdateNoteModal from '../components/modals/edit_note';
import { useDrawer } from '../contexts/DrawerProvider';
import { LoadingBar } from '../components/loading';
import { apiErrorIntoToast, useToast } from '../contexts/ToastProvider';
import { ApiError } from '../core/api';

const NoteEdit = lazy(() => import("../components/note/edit"))
const NoteView = lazy(() => import("../components/note/view"))

const Shelf: Component = () => {
  const params = useParams()
  const { api } = useApi()
  const { pushToast } = useToast()
  const user = useCurrentUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const { setModal, clearModal } = useModal()
  const drawer = useDrawer()

  const editMode = () => {
    return searchParams.edit !== undefined && searchParams.edit !== "false"
  }

  const slugParts: () => Breadcrumb = () => {
    return {
      username: params.username,
      bookSlug: params.bookSlug,
      noteSlug: params.noteSlug,
    }
  }

  const allowBookCreate = () => {
    return user()?.username === slugParts().username
  }

  const allowNoteCreate = () => {
    return user() && (book() && user()?.id === book()?.ownerId)
  }

  const [book, { mutate: setBook }] = createResource(slugParts, async ({ username, bookSlug }) => {
    if (!username || !bookSlug) return undefined
    let result = await api().getBookBySlug(username, bookSlug)
    if (result instanceof ApiError) pushToast(apiErrorIntoToast(result, `loading book ${username}/${bookSlug}`))
    else return result
  })

  const [note, { mutate: setNote }] = createResource(slugParts, async ({ username, bookSlug, noteSlug }) => {
    if (!username || !bookSlug || !noteSlug) return undefined
    let result = await api().getNoteBySlug(username, bookSlug, noteSlug)
    if (result instanceof ApiError) pushToast(apiErrorIntoToast(result, `loading note ${username}/${bookSlug}/${noteSlug}`))
    else return result
  })

  const breadcrumb: () => Breadcrumb = () => {
    return {
      username: params.username,
      bookSlug: book()?.name,
      noteSlug: note()?.name,
    }
  }

  const onNewBookClick = () => {
    setModal({
      component: NewBookModal,
      props: {
        onClose: (newBook?: Book) => {
          if (newBook) drawer.updateBook(newBook)
          clearModal()
        }, user: user()
      },
    })
  }
  const onNewNoteClick = () => {
    setModal({
      component: NewNoteModal,
      props: {
        onClose: (newNote?: Note) => {
          if (newNote) drawer.updateNote(newNote)
          clearModal()
        }, user: user(), book: book()
      },
    })
  }

  const onUpdateBookClick = () => {
    setModal({
      component: UpdateBookModal,
      props: {
        onClose: (newBook?: Book) => {
          if (newBook) {
            setBook(newBook)
            drawer.updateBook(newBook)
          }
          clearModal()
        },
        onDeleteClose: (bookId: string) => {
          drawer.deleteBook(bookId)
          clearModal()
        },
        user: user(), book: book()
      },
    })
  }

  const onUpdateNoteClick = () => {
    setModal({
      component: UpdateNoteModal,
      props: {
        onClose: (newNote?: Note) => {
          if (newNote) {
            setNote(newNote)
            drawer.updateNote(newNote)
          }
          clearModal()
        },
        onDeleteClose: (noteId: string) => {
          drawer.deleteNote(noteId)
          clearModal()
        },
        user: user(), book: book(), note: note(),
      },
    })
  }

  return (
    <div class="flex flex-col gap-4">
      <div class="flex gap-4">
        <div class="btn-group rounded-lg shadow-md bg-base-200">
          <button
            onclick={onNewBookClick}
            class="btn btn-ghost"
            type="button"
            classList={{ "btn-disabled": !allowBookCreate() }}
            title="Create New Notebook"
          >
            <FiFolderPlus size={20} />
          </button>
          <button
            onclick={onNewNoteClick}
            class="btn btn-ghost"
            type="button"
            classList={{ "btn-disabled": !allowNoteCreate() }}
            title="Create New Note"
          >
            <FiFilePlus size={20} />
          </button>
          <Switch>
            <Match when={book() && !note()}>
              <button
                onclick={onUpdateBookClick}
                class="btn btn-ghost"
                type="button"
                classList={{ "btn-disabled": !allowNoteCreate() }}
                title="Notebook Settings"
              >
                <FiSettings size={20} />
              </button>
            </Match>
            <Match when={book() && note()}>
              <button
                onclick={onUpdateNoteClick}
                class="btn btn-ghost"
                type="button"
                classList={{ "btn-disabled": !allowNoteCreate() }}
                title="Note Settings"
              >
                <FiSettings size={20} />
              </button>
            </Match>
          </Switch>
        </div>
        <NoteBreadcrumb class="flex-1" {...breadcrumb()} />
        <Show when={note()}>
          <label class="label cursor-pointer gap-3 p-2 rounded-md shadow-md bg-base-200">
            <span class="label-text">Edit</span>
            <input type="checkbox" class="toggle" checked={editMode()} onchange={(_) => {
              if (editMode()) { setSearchParams({ edit: undefined }) }
              else { setSearchParams({ edit: "true" }) }
            }} title="Toggle View/Edit Mode" />
          </label>
        </Show>
      </div>
      <Show when={!note.loading} fallback={<LoadingBar />}>
        <Show when={note()} fallback={
          <div class="hero pt-6 bg-base-200 rounded-md">
            <div class="hero-content text-center">
              <div class="max-w-md">
                <h1 class="text-5xl font-bold">No Note Selected</h1>
                <p class="py-6">Either create a new note or select an existing one.</p>
              </div>
            </div>
          </div>
        }>
          {note => <Switch>
            <Match when={!editMode()}>
              <NoteView note={note()} />
            </Match>
            <Match when={editMode()}>
              <NoteEdit note={note()} />
            </Match>
          </Switch>
          }
        </Show>
      </Show>
    </div>
  );
};

export default Shelf;
