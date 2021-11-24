const form = document.getElementById('login-form');
const mfaForm = document.getElementById('mfa-form');

form.addEventListener('submit', e => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  login(username, password)
    .then(res => {
      const alert = document.getElementById('alert');

      if (!res.success) {
        alert.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${res.error}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
      } else {
        document.getElementById('qr-code').src = res.data;
        document.getElementById('mfa').style.display = 'initial';
        document.getElementById('username').disabled = true;
        document.getElementById('password').disabled = true;
        alert.innerHTML = null;
      }
    })
    .catch(err => console.log('Error:' + err));
});

mfaForm.addEventListener('submit', e => {
  e.preventDefault();
  const otp = document.getElementById('otp').value;
  const username = document.getElementById('username').value;

  mfaVerify(otp, username)
    .then(res => {
      const alert = document.getElementById('alert-2');
      const className = res.success ? 'alert-success' : 'alert-danger';

      alert.innerHTML = `<div class="alert ${className} alert-dismissible fade show" role="alert">${
        res.success ? res.data : res.error
      }<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
    })
    .catch(err => console.log('Error:' + err));
});

const login = async (username, password) => {
  const data = {
    username,
    password
  };

  const response = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  return await response.json();
};

const mfaVerify = async (otp, username) => {
  const data = {
    otp,
    username
  };

  const response = await fetch('http://localhost:5000/api/mfaVerify', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  return await response.json();
};
