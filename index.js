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
};
window.addEventListener(loadEventName, function (obj) {
  console.log(obj);
  if (obj.detail != null) {
    userOptions = obj.detail.fieldData;
    userOptions.channelName = obj.detail.channel.username;
  } else {
    userOptions = DUMMY_DATA;
  }
});
