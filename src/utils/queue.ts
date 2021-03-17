interface LinkedNode<T> {
  value: T;
  next?: LinkedNode<T>;
}

export class Queue<T> {
  head?: LinkedNode<T>;
  tail?: LinkedNode<T>;
  constructor() {}

  empty() {
    return this.head === undefined;
  }

  append(value: T) {
    if (this.empty()) {
      this.head = this.tail = { value };
      return;
    }
    if (this.tail) {
      this.tail.next = { value };
      this.tail = this.tail.next;
      return;
    }
    throw new Error("Queue detected in invalid state.");
  }

  serve(): T {
    if (this.empty()) {
      throw new Error("Cannot serve with empty queue.");
    }
    const result = this.head!.value;
    this.head = this.head!.next;
    return result;
  }
}
