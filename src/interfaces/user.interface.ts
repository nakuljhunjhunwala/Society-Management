export interface ResponseUser {
  userId: string;
  username: string;
  role: {
    [key: string]: string;
  };
}
