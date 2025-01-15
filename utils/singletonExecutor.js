export class ReplacementError extends Error {
  constructor(message) {
    super(message);
    this.name = "ReplacementError";
  }
}

export default class SingletonExecutor {
  constructor() {
    this.scheduledTask = null;
    this.runningTask = null;
  }

  async _executeAllScheduledTasks() {
    let result;

    // scheduled task might be set again during the await
    // if that happens, the result is discarded and the loop is repeated
    do {
      this.runningTask = this.scheduledTask;
      this.scheduledTask = null;
      result = await this.runningTask;
      this.runningTask = null;
    } while (this.scheduledTask);

    return result;
  }

  async execute(promise) {
    // if another task is alread running, schedule the requested promise next
    // it will be picked up by the original caller
    if (this.runningTask) {
      this.scheduledTask = promise;
      throw new ReplacementError("Task was scheduledto be executed by the original caller");
    }

    // if no task is running, run the requested promise now
    this.scheduledTask = promise;
    return await this._executeAllScheduledTasks();
  }
}
