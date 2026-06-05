import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common'
import { SchedulerRegistry } from '@nestjs/schedule'
import { CronJob } from 'cron'
import { ExecutionRunnerService } from '../executions/execution-runner.service'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class SchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SchedulerService.name)

  constructor(
    private prisma: PrismaService,
    private executionRunner: ExecutionRunnerService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async onApplicationBootstrap() {
    const workflows = await this.prisma.workflow.findMany({
      where: { isEnabled: true, cronExpression: { not: null } },
    })
    for (const wf of workflows) {
      if (wf.cronExpression) {
        this.scheduleWorkflow(wf.id, wf.userId, wf.cronExpression)
      }
    }
    this.logger.log(`Scheduled ${workflows.length} cron workflow(s)`)
  }

  scheduleWorkflow(workflowId: string, userId: string, cronExpression: string) {
    this.unscheduleWorkflow(workflowId)
    try {
      const job = new CronJob(cronExpression, () => {
        this.executionRunner.run(workflowId, userId).catch((err) =>
          this.logger.error(`Cron execution failed for ${workflowId}: ${err.message}`),
        )
      })
      this.schedulerRegistry.addCronJob(workflowId, job)
      job.start()
      this.logger.log(`Scheduled workflow ${workflowId} with cron: ${cronExpression}`)
    } catch (err: any) {
      this.logger.error(`Invalid cron expression for ${workflowId}: ${err.message}`)
    }
  }

  unscheduleWorkflow(workflowId: string) {
    if (this.schedulerRegistry.doesExist('cron', workflowId)) {
      this.schedulerRegistry.deleteCronJob(workflowId)
      this.logger.log(`Unscheduled workflow ${workflowId}`)
    }
  }
}
