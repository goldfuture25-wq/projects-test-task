(() => {
  const storageKey = 'training-projects-v1';
  const exampleProjects = [
    {
      name: 'Сайт кофейни «Лист»',
      description: 'Учебный макет страницы для вымышленной кофейни.',
    },
    {
      name: 'Каталог книг «Полка»',
      description: 'Пример каталога с описаниями вымышленных книг.',
    },
    {
      name: 'План поездки «Север»',
      description: 'Тестовый проект для организации маршрута и заметок.',
    },
    {
      name: 'Студия «Контур»',
      description: 'Черновик страницы вымышленной дизайн-студии.',
    },
  ];

  let savedProjects = [];
  try {
    const storedProjects = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(storedProjects)) {
      savedProjects = storedProjects.filter(
        (project) => project &&
          typeof project.name === 'string' &&
          typeof project.description === 'string',
      );
    }
  } catch {
    // Если данные повреждены или хранилище недоступно, показываем тестовые проекты.
  }

  const projectList = document.querySelector('#list');
  const projectCount = document.querySelector('#count');
  const searchInput = document.querySelector('#search');
  const backdrop = document.querySelector('#backdrop');
  const projectForm = document.querySelector('#form');
  const nameInput = document.querySelector('#name');
  const descriptionInput = document.querySelector('#description');
  let previousFocus;

  function validateField(field) {
    const isEmpty = !field.value.trim();
    const error = document.querySelector(`#${field.id}-error`);
    error.textContent = isEmpty
      ? (field === nameInput ? 'Введите название проекта' : 'Введите описание')
      : '';
    field.classList.toggle('invalid', isEmpty);
    field.setAttribute('aria-invalid', String(isEmpty));
    return !isEmpty;
  }

  for (const field of [nameInput, descriptionInput]) {
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') {
        validateField(field);
      }
    });
  }

  function renderProjects() {
    const searchTerm = searchInput.value.trim().toLocaleLowerCase('ru');
    const matchingProjects = [...savedProjects, ...exampleProjects].filter(
      (project) => project.name.toLocaleLowerCase('ru').includes(searchTerm),
    );

    projectCount.textContent = searchTerm
      ? `Найдено: ${matchingProjects.length}`
      : `Все проекты · ${matchingProjects.length}`;
    projectList.replaceChildren();

    if (!matchingProjects.length) {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'empty';
      emptyMessage.textContent = 'Проекты с таким названием не найдены.';
      projectList.append(emptyMessage);
      return;
    }

    for (const project of matchingProjects) {
      const card = document.createElement('article');
      card.className = 'card';

      const title = document.createElement('h2');
      title.textContent = project.name;

      const description = document.createElement('p');
      description.textContent = project.description;

      card.append(title, description);
      projectList.append(card);
    }
  }

  function closeForm() {
    backdrop.hidden = true;
    projectForm.reset();

    for (const field of [nameInput, descriptionInput]) {
      field.classList.remove('invalid');
      field.removeAttribute('aria-invalid');
      document.querySelector(`#${field.id}-error`).textContent = '';
    }

    previousFocus?.focus();
  }

  document.querySelector('#create').addEventListener('click', () => {
    previousFocus = document.activeElement;
    backdrop.hidden = false;
    nameInput.focus();
  });

  document.querySelector('#cancel').addEventListener('click', closeForm);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeForm();
  });

  document.addEventListener('keydown', (event) => {
    if (backdrop.hidden) return;
    if (event.key === 'Escape') closeForm();

    if (event.key === 'Tab') {
      const controls = [...backdrop.querySelectorAll('input,textarea,button')];
      const first = controls[0];
      const last = controls.at(-1);

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  projectForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const validName = validateField(nameInput);
    const validDescription = validateField(descriptionInput);
    if (!validName || !validDescription) {
      (validName ? descriptionInput : nameInput).focus();
      return;
    }

    const project = {
      name: nameInput.value.trim(),
      description: descriptionInput.value.trim(),
    };
    const updatedProjects = [project, ...savedProjects];

    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedProjects));
    } catch {
      alert('Не удалось сохранить проект в этом браузере. Проверьте настройки хранилища.');
      return;
    }

    savedProjects = updatedProjects;
    searchInput.value = '';
    renderProjects();
    closeForm();
  });

  searchInput.addEventListener('input', renderProjects);
  renderProjects();
})();