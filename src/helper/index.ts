export class Helper {
  static isCommonElement(arr1: any[], arr2: any[]) {
    return arr1.some(item => arr2.includes(item));
  }
  static getCallStack(self: any) {
    const err = new Error();
    let methodName;
    // tslint:disable-next-line:max-line-length
    if (/at \w+\.(\w+)/.exec(err.stack.split('\n')[2])[1] === undefined) {
      methodName = null;
    } else {
      methodName = /at \w+\.(\w+)/.exec(err.stack.split('\n')[2])[1];
    }
    console.log(`inside class ${self.name} -> calling ${methodName}`);
  }
}
