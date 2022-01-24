const fileReader = new FileReader();
const spaceSeparatedRegex = new RegExp(/(\d+[ ])+/g);
const commaSeparatedRegex = new RegExp(/(\d+[,])+/g);
const adjacentCoordinates = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

let dimensions = [3, 3];
let inputMatrix = [];
let outputMatrix = [];
let delimiter = null;
let content = "";

function alertError(message = null) {
  alert(`Error occurred${`: ${message}`}`);
}

/**
 * A function to print a 2D matrix
 * @param matrix: The matrix
 * @returns {string}: the matrix using with cells separated by delimiter
 */
function toString(matrix) {
  try {
    let matrixString = "";
    let i, j;

    for (i = 0; i < matrix.length; i++) {
      matrixString = `${matrixString}${i === 0 ? "" : "\n"}`;

      for (j = 0; j < matrix[0].length; j++) {
        matrixString = `${matrixString}${j === 0 ? "" : delimiter}${
          matrix[i][j]
        }`;
      }
    }

    return matrixString;
  } catch (e) {
    alertError(e.message);
  }
}

/**
 * A function to set the delimiter between cells
 * @param row: the element to check the separator
 */
function setDelimiter(row) {
  try {
    const isDelimiterASpace = spaceSeparatedRegex.test(row);

    if (isDelimiterASpace) {
      delimiter = " ";
    } else {
      delimiter = commaSeparatedRegex.test(row) ? "," : null;
    }
  } catch (e) {
    alertError(e.message);
  }
}

/**
 * A function to set a specific value to an element
 * @param elementName: The element whose value to be set
 * @param value: The value to be set inside the element
 */
function setValue(elementName, value) {
  try {
    const element = document.getElementById(elementName);

    if (element) {
      element.innerText = value;
    } else {
      alertError("Element not found");
    }
  } catch (e) {}
}

/**
 * The function to read the input from the file and map it inside a 2D matrix
 */
function parseValues() {
  try {
    content = fileReader.result;

    if (content) {
      // Implement it on a different thread in order not to freeze the frontend
      setTimeout(() => {
        const rows = content.split("\n");
        if (rows && rows.length > 0) {
          // Update the delimiter
          setDelimiter(rows[0]);

          // If the input is valid
          if (delimiter) {
            for (const row of rows) {
              inputMatrix.push(row.split(delimiter).map(Number));
            }

            // Set the dimensions of matrices
            dimensions = [inputMatrix.length, inputMatrix[0].length];

            // Take to another thread
            setTimeout(() => setValue("input", toString(inputMatrix)));

            // Copy by value
            outputMatrix = JSON.parse(JSON.stringify(inputMatrix));

            // Take to another thread
            setTimeout(() => {
              checkValues();
              setValue("output", toString(outputMatrix));
            });
          } else {
            alertError("Invalid input");
          }
        }
      });
    } else {
      alertError("No Input");
    }
  } catch (e) {
    alertError(e.message);
  }
}

/**
 * The action to read a file
 * @param event: The event to be emitted on input
 */
function readInput(event) {
  try {
    if (
      event &&
      event.target &&
      event.target.files &&
      event.target.files.length > 0
    ) {
      const file = event.target.files[0];
      fileReader.onload = () => parseValues();
      fileReader.readAsText(file);
    }
  } catch (e) {
    alertError(e.message);
  }
}

/**
 * The function to calculate the interpolated value
 * @param x: the x index of the cell to be interpolated
 * @param y: The y index of the cell to be interpolated
 * @returns {number|number}: the interpolated value
 */
function getInterpolation(x, y) {
  let validCoordinates = 0;
  let interpolatedValue = 0;

  try {
    for (const coordinate of adjacentCoordinates) {
      // If the coordinate is within the boundaries of the list
      if (
        coordinate[0] + x >= 0 &&
        coordinate[0] + x < dimensions[0] &&
        coordinate[1] + y >= 0 &&
        coordinate[1] + y < dimensions[1]
      ) {
        interpolatedValue += inputMatrix[x + coordinate[0]][y + coordinate[1]];
        validCoordinates++;
      }
    }

    return validCoordinates === 0
      ? 0
      : Math.round(interpolatedValue / validCoordinates);
  } catch (e) {
    alertError(e.message);
    return -1;
  }
}

/**
 * The value to check for bad values
 */
function checkValues() {
  try {
    for (let i = 0; i < dimensions[0]; i++) {
      for (let j = 0; j < dimensions[1]; j++) {
        outputMatrix[i][j] =
          outputMatrix[i][j] === 0
            ? getInterpolation(i, j)
            : outputMatrix[i][j];
      }
    }
  } catch (e) {
    alertError(e.message);
  }
}

/**
 * The main action on initialization to listen for input event
 */
document.getElementById("fileInput").addEventListener("input", readInput, true);
