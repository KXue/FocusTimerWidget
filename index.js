let loadEventName = "load";
let userOptions = {};
const DUMMY_DATA = {
  channelName: "TEST",
  maxTime: 60,
  minTime: 25,
  adaptiveBreak: true,
  breakFactor: 0.2,
  longBreakFactor: 0.6,
  longBreakInterval: 4,
  workDoneChime: "",
  breakDoneChime: "",
  startCommand: "!start",
  pauseCommand: "!pause",
  nextCommand: "!next",
  skipCommand: "!skip",
  resetCommand: "!reset"
};
const COMMANDS = [];

function StartTimer(){

}
function PauseTimer(){

}
function Next(){

}
function Skip(){

}
function Reset(count){

}

function CreateCommands(){
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

  const skipCommand = {};
  skipCommand.condition = new RegExp("(^|\s)" + userOptions.skipCommand + "($|\s)", 'i');
  skipCommand.callback = Skip;
  COMMANDS.push(skipCommand);

  const resetCommand = {};
  resetCommand.condition = new RegExp("(^|\s)" + userOptions.resetCommand + "($|\s)", 'i');// TODO change to lookback condition
  resetCommand.execArgs = true;
  resetCommand.callback = Reset;
  COMMANDS.push(resetCommand);
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