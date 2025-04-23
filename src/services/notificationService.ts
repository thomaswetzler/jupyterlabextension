/**
 * Simple notification service for the extension.
 */
export class NotificationService {
  /**
   * Emit a notification with a message.
   * 
   * @param message - The notification message
   * @returns The notification ID
   */
  emit(message: string): string {
    const id = this.generateId();
    console.log(`Notification: ${message}`);
    return id;
  }

  /**
   * Update a notification.
   * 
   * @param options - The notification update options
   */
  update(options: {
    id: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    autoClose?: number;
  }): void {
    console.log(`Notification update (${options.type}): ${options.message}`);
  }

  /**
   * Generate a unique ID for a notification.
   * 
   * @returns A unique ID
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
