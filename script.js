const cursor = document.querySelector('.custom-cursor');
let size = 40;
const minSize = 40;
const maxSize = 128;

// Create input element
const input = document.createElement('input');
input.type = 'text';
input.className = 'todo-input';
input.placeholder = 'Write a task...';
document.body.appendChild(input);
input.style.display = 'none';

// Mouse movement
document.addEventListener('mousemove', (e) => {
  cursor.style.left = `${e.clientX - size / 2}px`;
  cursor.style.top = `${e.clientY - size / 2}px`;
});

// Wheel scroll = resize
document.addEventListener('wheel', (e) => {
  size += e.deltaY < 0 ? 8 : -8;
  size = Math.max(minSize, Math.min(maxSize, size));
  cursor.style.width = size + 'px';
  cursor.style.height = size + 'px';

  // Dynamically resize input and text
  input.style.fontSize = `${size / 2.5}px`;
  input.style.padding = `${size / 5}px ${size / 3}px`;
});

// Click anywhere to place input
let currentX = 0, currentY = 0;
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) return; // prevent input on delete
  if (e.target.classList.contains('todo-box')) return; // prevent input on delete
  if (e.target.classList.contains('todotext')) return; // prevent input on delete
  if (e.target.classList.contains('todo-input')) return; // prevent input on delete

  currentX = e.clientX;
  currentY = e.clientY;
  if (currentX>window.innerWidth-400) currentX = currentX-100-size*4;
  input.style.left = `${currentX}px`;
  input.style.top = `${currentY}px`;
  input.style.display = 'block';
  input.style.fontSize = `${size / 2.5}px`;
  input.style.padding = `${size / 5}px ${size / 3}px`;
  input.focus();
});

// Press Enter to save to-do
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && input.value.trim() !== '') {
    const todoData = {
      id: Date.now(),
      text: input.value.trim(),
      x: currentX,
      y: currentY,
      size: size,
      completed: false
    };

    addTodoToPage(todoData);
    saveTodo(todoData);
    input.value = '';
    input.style.display = 'none';
  }
});

// Cancel input on right click
document.addEventListener('contextmenu', (e) => {
  if (input.style.display === 'block') {
    e.preventDefault(); // prevent right-click menu
    input.value = '';
    input.style.display = 'none';
  }
});

function toggleComplete(id) {
  const todos = JSON.parse(localStorage.getItem('todos') || '[]');
  const updated = todos.map(todo => {
    if (todo.id === id) {
      todo.completed = !todo.completed;
    }
    return todo;
  });
  localStorage.setItem('todos', JSON.stringify(updated));
}



// Add to screen
function addTodoToPage(data) {
  const todo = document.createElement('div');
  todo.className = 'todo-box';
  if (data.completed) todo.classList.add('completed');
  todo.style.left = `${data.x}px`;
  todo.style.top = `${data.y}px`;
  todo.setAttribute('data-id', data.id);
  todo.style.fontSize = `${data.size / 2.5}px`;
  todo.style.padding = `${data.size / 2}px ${data.size / 2}px`;

  const span = document.createElement('span');
  span.className = 'todotext'
  span.textContent = data.text;

  const del = document.createElement('button');
  del.textContent = '';
  del.className = 'delete-btn';
  del.onclick = () => {
    // gravity fall animation
    todo.classList.add('falling');
    setTimeout(() => {
      todo.remove();
      deleteTodo(data.id);
    }, 500);
  };

  //  todo.addEventListener('click', () => {
  //   todo.classList.toggle('completed');
  //   toggleComplete(data.id);
  // });

  todo.appendChild(span);
  todo.appendChild(del);
  document.body.appendChild(todo);

  // Cursor switch on hover
  todo.addEventListener('mouseenter', () => {
    cursor.style.display = 'none';
    document.body.style.cursor = 'default';
  });
  todo.addEventListener('mouseleave', () => {
    cursor.style.display = 'block';
    document.body.style.cursor = 'none';
  });

  enableDrag(todo);
}

// Save to localStorage
function saveTodo(data) {
  const todos = JSON.parse(localStorage.getItem('todos') || '[]');
  todos.push(data);
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Delete from localStorage
function deleteTodo(id) {
  let todos = JSON.parse(localStorage.getItem('todos') || '[]');
  todos = todos.filter(todo => todo.id !== id);
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Load on page
function loadTodos() {
  const todos = JSON.parse(localStorage.getItem('todos') || '[]');
  todos.forEach(addTodoToPage);
}

function enableDrag(todo) {
  let isDragging = false;
  let offsetX = 0, offsetY = 0;
  let moved = false; // Track if mouse moved

  todo.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('delete-btn')) return;

    isDragging = true;
    moved = false;
    offsetX = e.clientX - todo.offsetLeft;
    offsetY = e.clientY - todo.offsetTop;
    todo.style.zIndex = 1001;
    todo.style.transition = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      moved = true;
      todo.style.left = `${e.clientX - offsetX}px`;
      todo.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      todo.style.zIndex = '';
      todo.style.transition = '';

      // Only save position if it moved
      if (moved) {
        const id = parseInt(todo.getAttribute('data-id'));
        const todos = JSON.parse(localStorage.getItem('todos') || '[]');
        todos.forEach(t => {
          if (t.id === id) {
            t.x = todo.offsetLeft;
            t.y = todo.offsetTop;
          }
        });
        localStorage.setItem('todos', JSON.stringify(todos));
      }
    }
  });

  // ✅ Toggle complete only if NOT dragging
  todo.addEventListener('click', () => {
    if (!moved) {
      todo.classList.toggle('completed');
      const id = parseInt(todo.getAttribute('data-id'));
      toggleComplete(id);
    }
  });
}




loadTodos();

// Rain effect
const rainContainer = document.querySelector('.rain-container');

function createRain() {
  for (let i = 0; i < 80; i++) {
    const drop = document.createElement('div');
    drop.className = 'raindrop';
    drop.style.left = Math.random() * window.innerWidth + 'px';
    drop.style.animationDuration = 0.5 + Math.random() * 1.5 + 's';
    drop.style.animationDelay = Math.random() * 5 + 's';
    drop.style.opacity = Math.random();
    rainContainer.appendChild(drop);

    // Optional: remove drop after it falls
    setTimeout(() => drop.remove(), 7000);
  }
}

// Generate rain repeatedly
setInterval(createRain, 800);

// Fade screen when page loads
window.addEventListener('load', () => {
  const fadeScreen = document.getElementById('fade-screen');
  if (fadeScreen) {
    fadeScreen.style.opacity = '0';
    setTimeout(() => fadeScreen.remove(), 1500);
  }
});

const rainAudio = document.getElementById('rainAudio');
rainAudio.volume = 0;

// Fade-in after first click
window.addEventListener('click', () => {
  rainAudio.play().catch(() => {});

  // Fade in
  let vol = 0;
  const fadeIn = setInterval(() => {
    if (vol < 0.6) {
      vol += 0.02;
      rainAudio.volume = vol;
    } else {
      rainAudio.volume = 0.6;
      clearInterval(fadeIn);
    }
  }, 100);
}, { once: true });

// Seamless loop by restarting slightly before the end
rainAudio.addEventListener('timeupdate', () => {
  const buffer = 0.4; // seconds before end to restart
  if (rainAudio.duration && rainAudio.currentTime >= rainAudio.duration - buffer) {
    rainAudio.currentTime = 0;
    rainAudio.play();
  }
});




