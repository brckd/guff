/**
 * The scope the cooldown applies to.
 */
export enum BucketScope {
  /**
   * Per channel cooldowns.
   */
  Channel,
  /**
   * Global cooldowns.
   */
  Global,
  /**
   * Per guild cooldowns.
   */
  Guild,
  /**
   * Per user cooldowns.
   */
  User
}
