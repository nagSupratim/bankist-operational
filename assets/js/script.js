'use strict';

// Data
const accounts = [
  {
    owner: 'Michael Scott',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,
    movementsDates: [
      '2019-11-18T21:31:17.178Z',
      '2019-12-23T07:42:02.383Z',
      '2020-01-28T09:15:04.904Z',
      '2020-04-01T10:17:24.185Z',
      '2020-05-08T14:11:59.604Z',
      '2020-05-27T17:01:17.194Z',
      '2021-09-18T23:36:17.929Z',
      '2021-09-19T10:51:36.790Z',
    ],
    currency: 'USD',
    locale: 'en-US',
  },
  {
    owner: 'Dwight Schrute',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
    movementsDates: [
      '2019-11-01T13:15:33.035Z',
      '2019-11-30T09:48:16.867Z',
      '2019-12-25T06:04:23.907Z',
      '2020-01-25T14:18:46.235Z',
      '2020-02-05T16:33:06.386Z',
      '2020-04-10T14:43:26.374Z',
      '2020-06-25T18:49:59.371Z',
      '2020-07-26T12:01:20.894Z',
    ],
    currency: 'EUR',
    locale: 'en-UK',
  },
  {
    owner: 'Jim Halpert',
    movements: [200, -200, 340, -300, -20, 50, 400, -460],
    interestRate: 0.7,
    pin: 3333,
    movementsDates: [
      '2019-11-01T13:15:33.035Z',
      '2019-11-30T09:48:16.867Z',
      '2019-12-25T06:04:23.907Z',
      '2020-01-25T14:18:46.235Z',
      '2020-02-05T16:33:06.386Z',
      '2020-04-10T14:43:26.374Z',
      '2020-06-25T18:49:59.371Z',
      '2020-07-26T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
  },
  {
    owner: 'Ryan Howard',
    movements: [430, 1000, 700, 50, 90],
    interestRate: 1,
    pin: 4444,
    movementsDates: [
      '2019-11-01T13:15:33.035Z',
      '2019-11-30T09:48:16.867Z',
      '2019-12-25T06:04:23.907Z',
      '2020-01-25T14:18:46.235Z',
      '2020-02-05T16:33:06.386Z',
    ],
    currency: 'USD',
    locale: 'en-US',
  },
];
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Methods
// General
const createUsernames = accounts => {
  accounts.forEach(account => {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .reduce((username, word) => username + word[0], '');
  });
};
createUsernames(accounts);

//Account specific
const formatMovementDate = (date, locale) => {
  const dayPassed = Math.round(
    Math.abs(new Date() - date) / (1000 * 60 * 60 * 24)
  );
  if (dayPassed === 0) return 'Today';
  if (dayPassed === 1) return 'Yesterday';
  if (dayPassed <= 7) return `${dayPassed} days ago`;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const formatCurr = (value, locale, currency) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
};

const displayMovements = (account, sort = false) => {
  //resetting hard coded html content
  containerMovements.innerHTML = '';
  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;
  //populating the list of movements to dom
  movs.forEach((mov, i) => {
    // getting the movement type
    const movementType = mov > 0 ? 'deposit' : 'withdrawal';
    const movdate = formatMovementDate(
      new Date(account.movementsDates[i]),
      account.locale
    );
    const formattedMovement = formatCurr(mov, account.locale, account.currency);
    // constructing the html for one movement row
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${movementType}">
          ${i + 1} ${movementType} 
        </div>
        <div class="movements__date">${movdate}</div>
        <div class="movements__value">${formattedMovement}</div>
      </div>
    `;
    // updaing the ui with the same
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = account => {
  account.balance = account.movements.reduce((tot, mov) => tot + mov, 0);
  labelBalance.textContent = formatCurr(
    account.balance,
    account.locale,
    account.currency
  );
};

const calcDisplaySummary = ({ movements, interestRate, locale, currency }) => {
  const income = movements
    .filter(mov => mov > 0)
    .reduce((sum, mov) => sum + mov, 0);
  const withdraw = movements
    .filter(mov => mov < 0)
    .reduce((sum, mov) => sum + mov, 0);
  const interest = movements
    .filter(mov => mov > 0)
    .reduce((sum, mov) => sum + (mov * interestRate) / 100, 0);
  labelSumIn.textContent = formatCurr(income, locale, currency);
  labelSumOut.textContent = formatCurr(Math.abs(withdraw), locale, currency);
  labelSumInterest.textContent = formatCurr(interest, locale, currency);
};

const updateUI = currentAccount => {
  //display movements
  displayMovements(currentAccount);
  //display balance
  calcDisplayBalance(currentAccount);
  //display summary
  calcDisplaySummary(currentAccount);
};

const startLogoutTimers = () => {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // in each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;
    // when O seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Login to get started';
      containerApp.style.opacity = 0;
    }
    //decrease time by 1 sec
    time--;
  };
  // set time remaining to 5sec
  let time = 300;
  // call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

let currentAccount, timer;
let sortedState = false;

//event handlers

btnLogin.addEventListener('click', event => {
  event.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === +inputLoginPin.value) {
    //display ui and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    //current date and time
    const now = new Date();
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // reset input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginUsername.blur();
    inputLoginPin.blur();
    if (timer) clearInterval(timer);
    timer = startLogoutTimers();
    //update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', event => {
  event.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiver = accounts.find(acc => acc.username === inputTransferTo.value);
  if (
    amount > 0 &&
    amount <= currentAccount.balance &&
    receiver &&
    receiver.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiver.movements.push(amount);
    receiver.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
  }
  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferTo.blur();
  inputTransferAmount.blur();

  //reset timer
  clearInterval(timer);
  timer = startLogoutTimers();
});

btnLoan.addEventListener('click', event => {
  event.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(() => {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
    }, 2500);
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();

  //reset timer
  clearInterval(timer);
  timer = startLogoutTimers();
});

btnClose.addEventListener('click', event => {
  event.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
  inputCloseUsername.blur();
  inputClosePin.blur();
});

btnSort.addEventListener('click', event => {
  event.preventDefault();
  sortedState = !sortedState;
  displayMovements(currentAccount, sortedState);
});
