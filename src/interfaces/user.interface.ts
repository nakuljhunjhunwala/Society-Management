export interface ResponseUser {
  userId: string;
  username: string;
  isAdmin?: boolean;
  role: {
    [key: string]: string;
  };
}
