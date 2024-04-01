#! /usr/bin/env node
import inquirer from "inquirer";

const setTimePromise = (timer: number, message: string) => {
  return new Promise((resolve) => {
    setTimeout(
      (resolve) => {
        process.stdout.write(message);
        resolve("");
      },
      timer,
      resolve
    );
  });
};
// loading function to slow down transaction to make real atm like feel
const loading = async (message: string) => {
  process.stdout.write("Please wait ");
  let stars = "*";
  for (let i = 0; i <= 30; i++) {
    await setTimePromise(150, stars);
  }
  console.log("\n");
  console.log(message);
};
const pin: number = 1234;
let balance: number = 10000;
let isPinCorrect: boolean = false;
let isOperation: boolean = true;
let inputStr: string = "";

// overwriting prompt answer display so that it only takes 4 digit max for pin
process.stdin.on("data", (key: Buffer) => {
  const input = key.toString();
  // for detecting backspace key
  if (
    input === "\u0008" ||
    input === "\x08" ||
    input === "\x7F" ||
    input === "\b"
  ) {
    inputStr = inputStr.slice(0, inputStr.length - 1);
    // if pin doesnt exceed 4 digit limit and also is a number
  } else if (inputStr.length < 4 && !isNaN(Number(input))) {
    inputStr = inputStr + input;
    // to avoid spacebar key
    inputStr = inputStr.trim();
  }
});

while (!isPinCorrect) {
  const ansPin = await inquirer.prompt([
    {
      name: "pin",
      message: "Please enter your pin",
      transformer: () => inputStr,
      filter: () => Number(inputStr),
      type: "number",
    },
  ]);
  isPinCorrect = ansPin.pin === pin;
  inputStr = "";
  if (!isPinCorrect) {
    console.log("Sorry, you have entered incorrect pin.");
  }
}

while (isOperation) {
  const { selectedOperation } = await inquirer.prompt([
    {
      name: "selectedOperation",
      message: "Please select from the following operations: ",
      type: "list",
      choices: ["Balance Inquiry", "Cash Withdrawal", "Fast Cash"],
    },
  ]);

  if (selectedOperation === "Balance Inquiry") {
    console.log(`Your current balance is ${balance}`);
  } else {
    let amount: number = 0;
    if (selectedOperation === "Cash Withdrawal") {
      let isAmount500: boolean = false;
      while (!isAmount500) {
        const ansAmount = await inquirer.prompt([
          {
            name: "amount",
            message:
              "Please enter the amount \n (Amount must be in 500, 1000 or 5000 rupees note):",
            type: "number",
          },
        ]);
        isAmount500 = ansAmount.amount % 500 === 0 && ansAmount.amount > 0;
        if (!isAmount500) {
          console.log(
            "Sorry the amount entered is not in 500, 1000 or 5000 rupees note"
          );
        } else {
          amount = ansAmount.amount;
        }
      }
    } else {
      const ansFastAmount = await inquirer.prompt([
        {
          name: "amount",
          message: "Please select from the following amounts: ",
          type: "list",
          choices: [1000, 2000, 5000, 10000, 20000],
        },
      ]);
      amount = ansFastAmount.amount;
    }
    if (amount > balance) {
      await loading("Insuffient Funds");
    } else {
      balance -= amount;
      await loading(
        `Transaction succeeded. Your remaining balance is ${balance}`
      );
    }
  }
  const ansContinue = await inquirer.prompt([
    {
      name: "continue",
      message: "Do you want to perform another operation? ",
      type: "list",
      choices: ["Yes", "No"],
    },
  ]);

  isOperation = ansContinue.continue === "Yes" ? true : false;
}
console.log("Thanks for using ATM-simulation program");
