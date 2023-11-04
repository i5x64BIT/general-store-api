interface AuthoriseError {
  messege: string,
  code: number
}

class AuthoriseError extends Error {
  constructor(messege? : string){
    super(messege);
    this.code = 1;
  }
}
export default AuthoriseError
