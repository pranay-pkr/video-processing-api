export default class ErrorHandler {
  constructor(message: string, status: number) {
    this.message = message;
    this.status = status;
  }
  message: string;
  status: number;
}
