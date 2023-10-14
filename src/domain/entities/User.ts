class User {
  private user_id: number;
  private name: string;
  private email: string;
  private password: string;
  
  constructor(user_id: number, name: string, email: string, password: string) {
    this.user_id = user_id;
    this.name = name;
    this.email = email;
    this.password = password;
  }

  public getId(): number {
    return this.user_id;
  }

  public getName(): string {
    return this.name;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPassword(): string {
    return this.password;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public setEmail(email: string): void {
    this.email = email;
  }

  public setPassword(password: string): void {
    this.password = password;
  }
}

export default User;