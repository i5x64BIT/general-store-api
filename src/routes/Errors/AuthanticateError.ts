interface AuthanticateError {
  messege: string,
  code: number
}

class AuthanticateError extends Error {
  constructor(messege? : string){
    super(messege);
    this.code = 1;
  }
}
export default AuthanticateError
