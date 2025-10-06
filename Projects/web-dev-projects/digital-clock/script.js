function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  let session = "AM";

  if (hours >= 12) {
    session = "PM";
  }
  if (hours > 12) {
    hours -= 12;
  }
  if (hours === 0) {
    hours = 12;
  }

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  const time = `${hours}:${minutes}:${seconds} ${session}`;
  document.getElementById("clock").textContent = time;
}

setInterval(updateClock, 1000);
updateClock();
