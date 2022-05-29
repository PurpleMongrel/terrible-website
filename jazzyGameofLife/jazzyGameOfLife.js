let backgroundColor = "transparent";
let boxColor = "white";
let shadowColor = "#9CF014"

let buttonHolder = document.getElementById("buttonHolder")

function gridFunction(size) {
  buttonHolder.style.width = size * 10 + "px";
  let grid = document.getElementById("grid");
  grid.style.width = size * 10 + "px";
  for (let i = 0; i < size; i++) {
    let row = document.createElement("div");
    row.style.display = "flex"
    row.style.margin = "0px";
    row.style.padding = "0px";
    grid.appendChild(row);
    for (let j = 0; j < size; j++) {
      let cell = document.createElement("p");
      cell.style.margin = "0px";
      cell.style.padding = "0px";
      cell.style.height = "10px";
      cell.style.width = "10px";
      cell.style.background = backgroundColor;
      cell.style.boxShadow = "";
      cell.style.borderRadius = "10px"
      if (Math.random() > 0.90) {
        cell.style.background = boxColor;
        cell.style.boxShadow = "0px 0px 15px " + shadowColor;
      }
      row.appendChild(cell);
    }
  }
  return grid;
}
//
function neighborCount(grid, xx, yy) {
  let count = 0;
  for (let y = yy - 1; y <= yy + 1; y++) {
    for (let x = xx - 1; x < xx + 2; x++) {
      if (x != xx || y != yy) {
        if (grid.childNodes[y] != null) {
          if (grid.childNodes[y].childNodes[x] != null) {
            if (grid.childNodes[y].childNodes[x].style.background == boxColor) count++;
          }
        }
      }
    }
  }
  return count;
}


function run() {
  for (let y = 0; y < grid.childNodes.length; y++) {
    for (let x = 0; x < grid.childNodes[y].childNodes.length; x++) {
      let currentCell = grid.childNodes[y].childNodes[x];
      count = neighborCount(grid, x, y);
      if (currentCell.style.background == boxColor && (count < 2 || count > 3)) {
        currentCell.style.background = backgroundColor;
        currentCell.style.boxShadow = "";
      }
      else if (currentCell.style.background == backgroundColor && count == 3) {
        currentCell.style.background = boxColor;
        currentCell.style.boxShadow = "0px 0px 15px " + shadowColor;
      }
    }
  }
}

function cells() {
  let cellElements = document.querySelectorAll("p");
  return cellElements
}


function cellClickListener(cells) {
  for (let cell of cells) {
    cell.addEventListener("click", () => {
      if (cell.style.background == boxColor) {
        cell.style.background = backgroundColor;
        cell.style.boxShadow = "";
      } else {
        cell.style.background = boxColor;
        cell.style.boxShadow = "0px 0px 15px " + shadowColor;
      }
    })
  }
}


document.querySelector("#runButton").addEventListener("click", () => { run() })


document.querySelector("#autoRunButton").addEventListener("click", () => {
  if (running) {
    clearInterval(running);
    running = false;
  } else {
    running = setInterval(run, 130);
  }
})

document.querySelector("#restartButton").addEventListener("click", () => {
  window.location.reload();
});

document.querySelector("#clearButton").addEventListener("click", () => {
  let cellElements = cells();
  for (let cell of cellElements) {
    cell.style.background = backgroundColor;
    cell.style.boxShadow = "";
  }
})




let running = false;


runGameOfLife = function () {
  let grid = gridFunction(70);
  let cellList = cells()
  cellClickListener(cellList)
}



