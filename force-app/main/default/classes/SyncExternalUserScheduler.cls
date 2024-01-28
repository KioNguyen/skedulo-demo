public class SyncExternalUserScheduler implements Schedulable{
    public void execute(SchedulableContext ctx) {
        SyncExternalUserBatch batch = new SyncExternalUserBatch();
        Id batchId = Database.executeBatch(batch, 10);
    }
}