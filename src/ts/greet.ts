export class Greet {
  private greeting:string;

  public constructor(greeting:string) {
    this.greeting = greeting;
  }

  public greet():void {
    console.log(`${this.greeting}`);
  }
}
