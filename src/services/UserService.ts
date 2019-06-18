export class UserService {
  /**
   * Returns the ID of the user to whom the passed token belongs to.
   * @param userToken userToken from the request
   */
  static getUserIdFromToken(userToken: string): string {
    // right now we are just passing the user ID as string as the token
    return userToken;
  }
}
