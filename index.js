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
  maxTime: 60,
  minTime: 25,
  adaptiveBreak: true,
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
  Update(){
    this.elapsed = Date.now() - this.startTime;
    if (this.updateCallback){
      this.updateCallback();
    }
    if (this.elapsed >= this.totalTime){
      if (this.doneCallback){
        this.doneCallback();
      }
      Stop();
    }
  }
  Start(){
    this.startTime = Date.now();
    if (this.elapsed){ // resume logic
      this.startTime -= this.elapsed;
    }
    this.elapsed = 0;
    this.timer = setInterval(this.Update, 1000);
  }
  Pause(){
    clearInterval(this.timer);
    this.timer = null;
  }
  Stop(){
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

function DrawBar(timer, interval)
{
  let fraction = timer.elapsed / timer.totalTime;

  switch(interval){
    case INTERVALS.WORK:
      
      break;
    case INTERVALS.OVERTIME:
      break;
    default: // break
      break;
  }
}

function StartTimer(){
  timer.Start();
}

function PauseTimer()
{
  timer.Pause();
}

function Next()
{
  console.log("next");
  switch(currInterval)
  {
    case INTERVALS.WORK:
    case INTERVALS.OVERTIME:
      intervalCount++;

      if (intervalCount % userOptions.longBreakInterval == 0)
      {
        currInterval = INTERVALS.LONG_BREAK;
      }
      else
      {
        currInterval = INTERVALS.BREAK;
      }
    break;
    default:
      currInterval = INTERVALS.WORK;
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
  console.log(obj);
  if (obj.detail != null) 
  {
    userOptions = obj.detail.fieldData;
    userOptions.channelName = obj.detail.channel.username;
  } 
  else 
  {
    userOptions = DUMMY_DATA;
  }

  timer = new Timer(userOptions.minTime, Next, function(){
    DrawBar(timer, currInterval);
  });
  minBar = document.getElementById("min-bar");
  maxBar = document.getElementById("max-bar");
  focusLabel = document.getElementById("focus-label");
});

function IsModMessage(obj)
{
  return obj.detail.listener === 'message' && obj.detail.event.data.tags.mod === '1';
}

window.addEventListener('onEventReceived', function (obj) {
  if (IsModMessage(obj)){
    let event = obj.detail.event;
    COMMANDS.forEach((value)=>{
      if (value.condition.test(event.message)){
        if (value.execArgs){
          value.callback(value.condition.exec(event.message));
        }
        else{
          value.callback();
        }
      }
    });
  }
});