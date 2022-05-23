let loadEventName = "load";
const INTERVALS = {
  WORK: 0,
  OVERTIME: 1,
  BREAK: 2,
  LONG_BREAK: 3,
  MAX: 4
};
let userOptions = {};
const DUMMY_DATA = {
  channelName: "TEST",
  maxTime: 10,
  minTime: 5,
  adaptive: true,
  autoStart: true,
  breakFactor: 0.2,
  longBreakFactor: 0.6,
  longBreakInterval: 4,
  workDoneChime: "",
  breakDoneChime: "",
  startCommand: "!start",
  pauseCommand: "!pause",
  nextCommand: "!next",
  stopCommand: "!stop"
};
const COMMANDS = [];

class Timer{
  constructor(totalTime, doneCallback, updateCallback){
    this.totalTime = totalTime;
    this.doneCallback = doneCallback;
    this.updateCallback = updateCallback;
    this.elapsed = 0;
    this.startTime = 0;
  }
  SetTimeLimit(time){
    this.totalTime = time;
    if (this.timer){
      this.Stop();
      this.Start();
    }
  }
  SetDoneCallback(callback){
    this.doneCallback = callback;
  }
  SetUpdateCallback(callback){
    this.updateCallback = callback;
  }
  Update(self){
    self.elapsed = Date.now() - self.startTime;
    console.log("Update: " + self.startTime);
    console.log(self);
    if (self.updateCallback){
      self.updateCallback();
    }
    if (self.elapsed >= self.totalTime){
      if (self.doneCallback){
        self.doneCallback();
      }
    }
  }
  Start(){
    console.log(this);
    this.startTime = Date.now();
    console.log("start:" + this.startTime);
    if (this.elapsed){ // resume logic
      this.startTime -= this.elapsed;
    }
    this.elapsed = 0;
    this.timer = setInterval(this.Update, 1000, this);
  }
  Pause(){
    console.log("pause");
    clearInterval(this.timer);
    this.timer = null;
  }
  Stop(){
    console.log("stop");
    this.elapsed = 0;
    clearInterval(this.timer);
    this.timer = null;
  }
}

let timer = null;
let currInterval = INTERVALS.WORK;
let intervalCount = 0;
let minBar = null;
let maxBar = null;
let focusLabel = null;
const timeHistory = [];
const historyLength = 5;

function DrawBar(timer, interval)
{
  let fraction = timer.elapsed / timer.totalTime;
  console.log("Draw: " + fraction);
  switch(interval){
    case INTERVALS.WORK:
      minBar.style.width = ((1 - fraction) * 100) + "%";
      focusLabel.textContent = "Work";
      break;
    case INTERVALS.OVERTIME:
      minBar.style.width = "0px";
      maxBar.style.width = ((1 - fraction) * 100) + "%";
      focusLabel.textContent = "Overtime";
      break;
    default: // break
      maxBar.style.width = "0px";
      minBar.style.width = (fraction * 100) + "%";
      focusLabel.textContent = "Chill";
      break;
  }
}

function Overtime()
{
  currInterval = INTERVALS.OVERTIME;
  timer.SetDoneCallback(Next);
  timer.SetTimeLimit(userOptions.maxTime - timer.elapsed);
  timer.Start();
}

function StartTimer()
{
  timer.Start();
}

function PauseTimer()
{
  timer.Pause();
}

function GetWorkTime(history)
{
  if (userOptions.adaptive && history != null && history.length > 0)
  {
    let totalTime = 0;
    for (let time in history)
    {
      totalTime += time;
    }
    return totalTime / history.length;
  }
  else
  {
    return userOptions.minTime;
  }
}

function LogTime(time, history, historyLength)
{
  if (history.length >= historyLength)
  {
    history.shift();
  }
  history.push(time);
}

function Next()
{
  console.log("next");
  switch(currInterval)
  {
    case INTERVALS.WORK:
    case INTERVALS.OVERTIME:
      let timeElapsed = timer.elapsed;
      
      if (currInterval == INTERVALS.OVERTIME) 
      {
        timeElapsed += GetWorkTime(timeHistory); 
      }

      LogTime(timeElapsed, timeHistory, historyLength);

      intervalCount++;
      let breakTime = 0;

      if (intervalCount % userOptions.longBreakInterval == 0)
      {
        currInterval = INTERVALS.LONG_BREAK;
        breakTime =  timeElapsed * userOptions.longBreakFactor;
      }
      else
      {
        currInterval = INTERVALS.BREAK;
        breakTime = timeElapsed * userOptions.breakFactor;
      }

      timer.SetTimeLimit(breakTime);
    break;
    default:
      currInterval = INTERVALS.WORK;
      timer.SetDoneCallback(Overtime);
    break;
  }
  if (!userOptions.autoStart)
  {
    timer.Stop();
  }
}

function Stop()
{
  timer.Stop();
}

function CreateCommands()
{
  const startCommand = {};
  startCommand.condition = new RegExp("(^|\s)" + userOptions.startCommand + "($|\s)", 'i');
  startCommand.callback = StartTimer;
  COMMANDS.push(startCommand);

  const pauseCommand = {};
  pauseCommand.condition = new RegExp("(^|\s)" + userOptions.pauseCommand + "($|\s)", 'i');
  pauseCommand.callback = PauseTimer;
  COMMANDS.push(pauseCommand);

  const nextCommand = {};
  nextCommand.condition = new RegExp("(^|\s)" + userOptions.nextCommand + "($|\s)", 'i');
  nextCommand.callback = Next;
  COMMANDS.push(nextCommand);

  const stopCommand = {};
  stopCommand.condition = new RegExp("(^|\s)" + userOptions.stopCommand + "($|\s)", 'i');
  stopCommand.execArgs = true;
  stopCommand.callback = Stop;
  COMMANDS.push(stopCommand);
}

window.addEventListener(loadEventName, function (obj) 
{
  if (obj.detail != null) 
  {
    userOptions = obj.detail.fieldData;
    userOptions.channelName = obj.detail.channel.username;
  } 
  else 
  {
    userOptions = DUMMY_DATA;
  }
  userOptions.minTime *= 60000; // converting minutes to milliseconds
  userOptions.maxTime *= 60000;
  timer = new Timer(userOptions.minTime, Overtime, function()
  {
    DrawBar(timer, currInterval);
  });
  minBar = document.getElementById("min-bar");
  maxBar = document.getElementById("max-bar");
  focusLabel = document.getElementById("focus-label");
  DrawBar(timer, currInterval);
});

function IsModMessage(obj)
{
  return obj.detail.listener === 'message' && obj.detail.event.data.tags.mod === '1';
}

window.addEventListener('onEventReceived', function (obj) {
  if (IsModMessage(obj)){
    let event = obj.detail.event;
    for (let command in COMMANDS){
      if (command.condition.test(event.message))
      {
        if (command.execArgs)
        {
          command.callback(command.condition.exec(event.message));
        }
        else
        {
          command.callback();
        }
      }
    }
  }
});