import { Server as SocketServer } from 'socket.io';
import { IUser } from "../models/user/user.model";
import { ITimeBudget, TimeBudget } from "../models/user/timeBudget.model";

export const emitChartData = (io: SocketServer, users: IUser[]) => {
  const chartData = users.map(user => ({
    name: user.username,
    visit: user.timeBudget ? (user.timeBudget as ITimeBudget).totalTime || 0  : 0,  
  }));

  io.emit('timebudget_totaltime', {
    response1: {
      color: "#FF8042",
      title: "Total Time",
      dataKey: "visit",
      chartData
    }
  });
};
