/** Base class for a module */
export abstract class Module {
  /** Unique name of the module */
  abstract name: string
  /** Location of the module */
  filepath?: string
}
