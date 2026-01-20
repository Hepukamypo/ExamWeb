/**
 * courses.js
 * Модуль для работы с курсами
 */

// Глобальные переменные
let allCourses = [];
let filteredCourses = [];
let currentCoursesPage = 1;
const coursesPerPage = 5;

/**
 * Отрисовка списка курсов
 * @param {Array} courses - массив курсов для отображения
 */
function renderCourses(courses) {
    allCourses = courses;
    filteredCourses = [...courses];
    
    const container = document.getElementById('coursesContainer');
    
    if (courses.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-book-open fs-1 text-muted mb-3"></i>
                <h4>Нет доступных курсов</h4>
                <p class="text-muted">В данный момент у нас нет открытых курсов для записи. Пожалуйста, проверьте позже.</p>
            </div>
        `;
        document.getElementById('coursesPagination').innerHTML = '';
        return;
    }
    
    // Пагинация
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
    const startIndex = (currentCoursesPage - 1) * coursesPerPage;
    const currentCourses = filteredCourses.slice(startIndex, startIndex + coursesPerPage);
    
    // Очистка контейнера
    container.innerHTML = '';
    
    // Отрисовка курсов
    currentCourses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'col';
        courseCard.innerHTML = `
            <div class="card h-100 border-0 shadow-sm hover-shadow">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <span class="badge bg-primary">${course.level}</span>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-h"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="showCourseDetails(${course.id})"><i class="fas fa-info-circle me-2"></i>Подробнее</a></li>
                                <li><a class="dropdown-item" href="#" onclick="selectCourse(${course.id})"><i class="fas fa-sign-in-alt me-2"></i>Записаться</a></li>
                            </ul>
                        </div>
                    </div>
                    <h4 class="card-title mb-2">${course.name}</h4>
                    <p class="card-text text-muted mb-3">${truncateText(course.description, 100)}</p>
                    <div class="mb-3">
                        <div class="d-flex align-items-center mb-1">
                            <i class="fas fa-chalkboard-teacher me-2 text-primary"></i>
                            <span class="fw-bold">Преподаватель:</span> <span class="ms-1">${course.teacher}</span>
                        </div>
                        <div class="d-flex align-items-center mb-1">
                            <i class="fas fa-clock me-2 text-primary"></i>
                            <span class="fw-bold">Длительность:</span> 
                            <span class="ms-1">${course.total_length} недель (${course.week_length} ч/нед)</span>
                        </div>
                        <div class="d-flex align-items-center">
                            <i class="fas fa-calendar-alt me-2 text-primary"></i>
                            <span class="fw-bold">Ближайший набор:</span>
                            <span class="ms-1">${formatNearestDate(course.start_dates)}</span>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                        <div>
                            <span class="text-muted fs-7">Стоимость за час:</span><br>
                            <span class="fw-bold text-primary">${course.course_fee_per_hour.toLocaleString('ru-RU')} ₽</span>
                        </div>
                        <button class="btn btn-primary" onclick="selectCourse(${course.id})">
                            <i class="fas fa-sign-in-alt me-1"></i>Записаться
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(courseCard);
    });
    
    // Генерация пагинации
    generatePagination('coursesPagination', totalPages, currentCoursesPage, setPage);
}

/**
 * Установка страницы пагинации
 * @param {number} page - номер страницы
 */
function setPage(page) {
    currentCoursesPage = page;
    renderCourses(allCourses);
    
    // Прокрутка к списку курсов
    document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Фильтрация курсов по поисковому запросу
 */
function filterCourses() {
    const searchTerm = document.getElementById('courseSearchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        filteredCourses = [...allCourses];
    } else {
        filteredCourses = allCourses.filter(course => 
            course.name.toLowerCase().includes(searchTerm) || 
            course.level.toLowerCase().includes(searchTerm) ||
            course.description.toLowerCase().includes(searchTerm) ||
            course.teacher.toLowerCase().includes(searchTerm)
        );
    }
    
    currentCoursesPage = 1;
    renderCourses(allCourses);
}

/**
 * Выбор курса для заявки
 * @param {number} courseId - ID выбранного курса
 */
function selectCourse(courseId) {
    const course = allCourses.find(c => c.id === courseId);
    if (!course) return;
    
    // Заполнение модального окна данными о курсе
    document.getElementById('orderId').value = '';
    document.getElementById('selectedCourseId').value = courseId;
    document.getElementById('courseName').value = course.name;
    document.getElementById('teacherName').value = course.teacher;
    document.getElementById('courseDuration').value = course.total_length;
    
    // Вычисление даты окончания (примерная)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // Примерная дата через неделю
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + course.total_length * 7);
    document.getElementById('endDate').textContent = endDate.toLocaleDateString('ru-RU');
    
    // Заполнение дат начала
    const dateSelect = document.getElementById('startDate');
    dateSelect.innerHTML = '<option value="">Выберите дату</option>';
    
    course.start_dates.forEach(dateStr => {
        const date = new Date(dateStr);
        const option = document.createElement('option');
        option.value = dateStr.split('T')[0]; // Только дата
        option.textContent = date.toLocaleDateString('ru-RU');
        dateSelect.appendChild(option);
    });
    
    // Сброс выбора времени
    const timeSelect = document.getElementById('startTime');
    timeSelect.innerHTML = '<option value="">Сначала выберите дату</option>';
    timeSelect.disabled = true;
    
    // Сброс дополнительных опций
    document.querySelectorAll('#orderForm input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Сброс количества студентов
    document.getElementById('studentsNumber').value = 1;
    
    // Сброс цены
    document.getElementById('totalPrice').textContent = '0 ₽';
    document.getElementById('priceBreakdown').innerHTML = '';
    
    // Открытие модального окна
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    modal.show();
    
    // Обработчик выбора даты
    dateSelect.addEventListener('change', function() {
        updateTimeOptions(course, this.value);
    });
}

/**
 * Обновление опций времени в зависимости от выбранной даты
 * @param {Object} course - объект курса
 * @param {string} selectedDate - выбранная дата
 */
function updateTimeOptions(course, selectedDate) {
    const timeSelect = document.getElementById('startTime');
    timeSelect.innerHTML = '';
    timeSelect.disabled = false;
    
    // Фильтрация времени для выбранной даты
    const availableTimes = course.start_dates
        .filter(dateStr => dateStr.startsWith(selectedDate))
        .map(dateStr => dateStr.split('T')[1].substring(0, 5));
    
    if (availableTimes.length === 0) {
        timeSelect.innerHTML = '<option value="">Нет доступного времени</option>';
        timeSelect.disabled = true;
        return;
    }
    
    availableTimes.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
    });
    
    // Автоматический расчет цены при выборе первого времени
    if (availableTimes.length > 0) {
        timeSelect.selectedIndex = 0;
        updatePriceCalculation();
    }
}

/**
 * Показать подробную информацию о курсе
 * @param {number} courseId - ID курса
 */
function showCourseDetails(courseId) {
    const course = allCourses.find(c => c.id === courseId);
    if (!course) return;
    
    // Формирование содержимого модального окна
    let detailsContent = `
        <h3>${course.name}</h3>
        <div class="mt-3">
            <p><strong>Уровень:</strong> ${course.level}</p>
            <p><strong>Преподаватель:</strong> ${course.teacher}</p>
            <p><strong>Длительность:</strong> ${course.total_length} недель (${course.week_length} часов в неделю)</p>
            <p><strong>Стоимость за час:</strong> ${course.course_fee_per_hour.toLocaleString('ru-RU')} ₽</p>
            <h5 class="mt-4">Описание</h5>
            <p>${course.description}</p>
            <h5 class="mt-4">Ближайшие даты начала</h5>
            <ul>
    `;
    
    course.start_dates.slice(0, 5).forEach(dateStr => {
        const date = new Date(dateStr);
        detailsContent += `<li>${date.toLocaleDateString('ru-RU')} в ${dateStr.split('T')[1].substring(0, 5)}</li>`;
    });
    
    if (course.start_dates.length > 5) {
        detailsContent += `<li>и еще ${course.start_dates.length - 5} дат</li>`;
    }
    
    detailsContent += `
            </ul>
        </div>
    `;
    
    // Создание и отображение модального окна
    const modalContent = `
        <div class="modal fade" id="courseDetailsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Детали курса</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
                    </div>
                    <div class="modal-body">
                        ${detailsContent}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                        <button type="button" class="btn btn-primary" onclick="selectCourse(${courseId})">Записаться на курс</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Добавление модального окна в DOM
    const existingModal = document.getElementById('courseDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalContent);
    
    // Инициализация и отображение модального окна
    const modal = new bootstrap.Modal(document.getElementById('courseDetailsModal'));
    modal.show();
}

/**
 * Форматирование ближайшей даты
 * @param {Array} dates - массив дат
 * @returns {string} - отформатированная дата
 */
function formatNearestDate(dates) {
    if (!dates || dates.length === 0) return 'Не указана';
    
    const now = new Date();
    const futureDates = dates
        .map(d => new Date(d))
        .filter(d => d > now)
        .sort((a, b) => a - b);
    
    if (futureDates.length === 0) return 'Закрыт для набора';
    
    const nearestDate = futureDates[0];
    return nearestDate.toLocaleDateString('ru-RU');
}

/**
 * Обрезка текста с добавлением многоточия
 * @param {string} text - исходный текст
 * @param {number} maxLength - максимальная длина
 * @returns {string} - обрезанный текст
 */
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

// Добавление функций в глобальную область видимости
window.filterCourses = filterCourses;
window.selectCourse = selectCourse;
window.showCourseDetails = showCourseDetails;
window.updateTimeOptions = updateTimeOptions;