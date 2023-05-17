import { Result } from "./core"
import { Book, CreateBook, CreateNote, Note, OAuth2AccessToken, OAuth2AccessTokenRequest, UpdateBook, UpdateNote, User } from "./types"

export type ApiDetails = {
    authToken?: string
    apiServer: string
}

export class ApiError extends Error {
    readonly status: number
    constructor(status: number, message?: string) {
        super(message)
        this.status = status
    }
}

class Api {
    private authToken?: string
    private apiServer: string
    constructor(apiDetails: ApiDetails) {
        this.authToken = apiDetails.authToken
        this.apiServer = apiDetails.apiServer
    }
    /**
     * allows for adjusting the main settings
     * without requiring a new object to be created.
     * @param apiDetails the new details
     * @returns self
     */
    setApi(apiDetails: ApiDetails): Api {
        this.authToken = apiDetails.authToken
        this.apiServer = apiDetails.apiServer
        return this
    }
    isAuthenticated(): boolean {
        return this.authToken !== undefined
    }
    async postToken(details: OAuth2AccessTokenRequest): Promise<Result<OAuth2AccessToken, ApiError>> {
        let reqURL = `${this.apiServer}/auth/token`
        let resp = await fetch(reqURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(details)
        })
        if (!resp.ok) return new Result<OAuth2AccessToken, ApiError>(new ApiError(resp.status))
        return new Result(await resp.json())
    }
    async postTokenPasswordFlow(username: string, password: string): Promise<Result<OAuth2AccessToken, ApiError>> {
        return await this.postToken({ grant_type: "password", username, password })
    }
    async getUsersMe(): Promise<Result<User, ApiError>> {
        let reqURL = `${this.apiServer}/users/me/`
        let resp = await fetch(reqURL, {
            headers: {
                "Authorization": `Bearer ${this.authToken}`
            }
        })
        if (!resp.ok) return new Result<User, ApiError>(new ApiError(resp.status))
        return new Result(await resp.json())
    }
    async createBook(book: CreateBook): Promise<Result<Book, ApiError>> {
        let reqURL = `${this.apiServer}/books/`
        let resp = await fetch(reqURL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.authToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(book),
        })
        if (!resp.ok) return new Result<Book, ApiError>(new ApiError(resp.status))
        return new Result(await resp.json())
    }
    async createNote(bookId: string, note: CreateNote): Promise<Result<Note, ApiError>> {
        let reqURL = `${this.apiServer}/books/${bookId}/notes/`
        let resp = await fetch(reqURL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.authToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(note),
        })
        if (!resp.ok) return new Result<Note, ApiError>(new ApiError(resp.status))
        return new Result(await resp.json())
    }
    async getBooksBySlug(username: string): Promise<Result<Book[], ApiError>> {
        let reqURL = `${this.apiServer}/slug/@${username}/books/`
        let resp = await fetch(reqURL, {
            headers: {
                "Authorization": `Bearer ${this.authToken}`
            }
        })
        if (!resp.ok) return new Result<Book[], ApiError>(new ApiError(resp.status))
        return new Result(await resp.json())
    }
    async getBookBySlug(username: string, bookSlug: string): Promise<Result<Book, ApiError>> {
        let reqURL = `${this.apiServer}/slug/@${username}/books/${bookSlug}/`
        let resp = await fetch(reqURL, {
            headers: {
                "Authorization": `Bearer ${this.authToken}`
            }
        })
        if (!resp.ok) return new Result<Book, ApiError>(new ApiError(resp.status))
        return new Result(await resp.json())
    }
    async getNotesBySlug(username: string, bookSlug: string): Promise<Result<Note[], ApiError>> {
        let reqURL = `${this.apiServer}/slug/@${username}/books/${bookSlug}/notes/`
        let resp = await fetch(reqURL, {
            headers: {
                "Authorization": `Bearer ${this.authToken}`
            }
        })
        if (!resp.ok) return new Result<Note[], ApiError>(new ApiError(resp.status))
        return new Result(await resp.json())
    }
    async getNoteBySlug(username: string, bookSlug: string, noteSlug: string): Promise<Result<Note, ApiError>> {
        let reqURL = `${this.apiServer}/slug/@${username}/books/${bookSlug}/notes/${noteSlug}/`
        let resp = await fetch(reqURL, {
            headers: {
                "Authorization": `Bearer ${this.authToken}`
            }
        })
        if (!resp.ok) return new Result<Note, ApiError>(new ApiError(resp.status))
        return new Result(await resp.json())
    }
    async getNoteContentById(noteId: string): Promise<Result<string, ApiError>> {
        let reqURL = `${this.apiServer}/notes/${noteId}/content/`
        let resp = await fetch(reqURL, {
            headers: {
                "Authorization": `Bearer ${this.authToken}`
            }
        })
        if (!resp.ok) return new Result<string, ApiError>(new ApiError(resp.status))
        return new Result<string, ApiError>(await resp.text())
    }
    async getNoteRenderedById(noteId: string): Promise<Result<string, ApiError>> {
        let reqURL = `${this.apiServer}/notes/${noteId}/rendered/`
        let resp = await fetch(reqURL, {
            headers: {
                "Authorization": `Bearer ${this.authToken}`
            }
        })
        if (!resp.ok) return new Result<string, ApiError>(new ApiError(resp.status))
        return new Result<string, ApiError>(await resp.text())
    }
    async updateBook(bookId: string, book: UpdateBook): Promise<Result<undefined, ApiError>> {
        let reqURL = `${this.apiServer}/books/${bookId}/`
        let resp = await fetch(reqURL, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${this.authToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(book),
        })
        if (!resp.ok) return new Result<undefined, ApiError>(new ApiError(resp.status))
        return new Result<undefined, ApiError>(undefined)
    }
    async updateNote(noteId: string, book: UpdateNote): Promise<Result<undefined, ApiError>> {
        let reqURL = `${this.apiServer}/notes/${noteId}/`
        let resp = await fetch(reqURL, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${this.authToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(book),
        })
        if (!resp.ok) return new Result<undefined, ApiError>(new ApiError(resp.status))
        return new Result<undefined, ApiError>(undefined)
    }
    async updateNoteContent(noteId: string, content: string): Promise<Result<undefined, ApiError>> {
        let reqURL = `${this.apiServer}/notes/${noteId}/content/`
        let resp = await fetch(reqURL, {
            method: "PUT",
            body: content,
            headers: {
                "Authorization": `Bearer ${this.authToken}`
            }
        })
        if (!resp.ok) return new Result<undefined, ApiError>(new ApiError(resp.status))
        return new Result<undefined, ApiError>(undefined)
    }
    async deleteBook(bookId: string): Promise<Result<undefined, ApiError>> {
        let reqURL = `${this.apiServer}/books/${bookId}/`
        let resp = await fetch(reqURL, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${this.authToken}`,
            },
        })
        if (!resp.ok) return new Result<undefined, ApiError>(new ApiError(resp.status))
        return new Result<undefined, ApiError>(undefined)
    }
    async deleteNote(noteId: string): Promise<Result<undefined, ApiError>> {
        let reqURL = `${this.apiServer}/notes/${noteId}/`
        let resp = await fetch(reqURL, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${this.authToken}`,
            },
        })
        if (!resp.ok) return new Result<undefined, ApiError>(new ApiError(resp.status))
        return new Result<undefined, ApiError>(undefined)
    }
}

export default Api
