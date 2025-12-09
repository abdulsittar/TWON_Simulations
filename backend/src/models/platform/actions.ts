import { ActionType } from "../shared/enums";

export interface UserActionModel {
  userId: string;           // ID of the user performing the action
  actionType: ActionType;   // Type of action (e.g., create_post, comment)
  targetId?: string;        // ID of the target (e.g., post ID, user ID)
  timestamp: Date;          // When the action was performed
}
