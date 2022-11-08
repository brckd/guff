import { Listener } from '../../core'
import { ActivitiesOptions, ActivityType, Client, ClientEvents } from 'discord.js'
import ms from 'ms'

export default class UpdatePresence extends Listener {
  event: keyof ClientEvents = 'ready'
  name = 'updatePresence'

  override run(client: Client) {
    client.user?.setPresence({
      activities: [this.initActivity]
    })

    setInterval(() => {
      const activity = this.activities[Math.floor(Math.random() * this.activities.length)]
      client.user?.setPresence({
        activities: [typeof activity === 'function' ? activity(client) : activity]
      })
    }, 10 * 1000)
  }

  initActivity = {
    type: ActivityType.Playing,
    name: 'restarting...'
  } as const

  activities: Array<ActivitiesOptions | ((client: Client) => ActivitiesOptions)> = [
    (c) => ({
      type: ActivityType.Watching,
      name: `${c.users.cache.size} users`
    }),
    (c) => ({
      type: ActivityType.Watching,
      name: `${c.guilds.cache.size} guilds`
    }),
    (c) => ({
      type: ActivityType.Playing,
      name: `for ${ms(c.uptime ?? NaN, { long: true })}`
    }),
    (c) => ({
      type: ActivityType.Listening,
      name: `${ms(c.ws.ping)} heartbeat`
    }),
    {
      type: ActivityType.Listening,
      name: '/Info'
    }
  ]
}
