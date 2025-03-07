import  responseLogger  from '../../utils/logs/logger';

export interface ILogger {

    logEvent(message: string): void; 
    
  }
  
export class SimpleLogger implements ILogger {
   logEvent(message: string): void {
    console.log(message); // Example implementation
    responseLogger.debug(message);
   }
 }
  