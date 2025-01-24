export default class ErrorHandler {
  constructor(message: string, status: number, timeStamp: string) {
    this.message = message;
    this.status = status;
  }
  message: string;
  status: number;
}
