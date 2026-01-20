// Глобальные переменные (требование 2 - осмысленные названия)
window.allCourses = [];
window.allTutors = [];
window.orders = [];
window.selectedTutorId = null;
const ITEMS_PER_PAGE = 5; // Требование 3.2.1

/**
 * Показать уведомление пользователю (требование 3.2.3)
 */
function showNotification(message, type = 'success') {
    const container = document.getElementById('notifications');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.role = 'alert';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    container.appendChild(notification);
    
    // Автоматическое закрытие через 5 секунд (требование 3.2.3)
    setTimeout(() => {
        if (notification.parentNode) {
            const bsAlert = bootstrap.Alert.getInstance(notification);
            if (bsAlert) {
                bsAlert.close();
            } else {
                notification.remove();
            }
        }
    }, 5000);
}

/**
 * Отобразить курсы на странице (требование 3.2.1)
 */
function renderCourses(courses, page = 1) {
    const container = document.getElementById('coursesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedCourses = courses.slice(startIndex, endIndex);
    
    paginatedCourses.forEach(course => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
        card.innerHTML = `
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">${course.name}</h5>
                    <p class="card-text">
                        <strong>Уровень:</strong> ${course.level}<br>
                        <strong>Преподаватель:</strong> ${course.teacher}<br>
                        <strong>Стоимость:</strong> ${course.course_fee_per_hour} ₽/час
                    </p>
                    <button class="btn btn-primary w-100 apply-btn" data-id="${course.id}">
                        Подать заявку
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Добавляем обработчики для кнопок
    document.querySelectorAll('.apply-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const courseId = btn.dataset.id;
            openOrderModal('course', courseId);
        });
    });
    
    renderPagination('courses', Math.ceil(courses.length / ITEMS_PER_PAGE), page);
}

/**
 * Отобразить репетиторов на странице (требование 3.3.1)
 */
function renderTutors(tutors, filters = {}) {
    const tbody = document.getElementById('tutorsTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const { language, level } = filters;
    let filteredTutors = [...tutors];
    
    if (language) {
        filteredTutors = filteredTutors.filter(tutor => 
            tutor.languages_offered.includes(language)
        );
    }
    
    if (level) {
        filteredTutors = filteredTutors.filter(tutor => 
            tutor.language_level === level
        );
    }
    
    filteredTutors.forEach(tutor => {
        const row = document.createElement('tr');
        row.dataset.id = tutor.id;
        row.className = selectedTutorId === tutor.id ? 'table-success' : '';
        row.innerHTML = `
            <td>${tutor.name}</td>
            <td>${tutor.language_level}</td>
            <td>${tutor.languages_offered.join(', ')}</td>
            <td>${tutor.work_experience}</td>
            <td>${tutor.price_per_hour} ₽/час</td>
            <td><img src="img/placeholder.jpg" width="50" class="rounded"></td>
            <td><button class="btn btn-sm btn-primary select-tutor">Выбрать</button></td>
        `;
        tbody.appendChild(row);
    });
    
    // Добавляем обработчики для кнопок выбора (требование 3.3.2)
    tbody.querySelectorAll('.select-tutor').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('tr');
            const tutorId = parseInt(row.dataset.id);
            
            // Снимаем выделение со всех строк
            tbody.querySelectorAll('tr').forEach(tr => {
                tr.classList.remove('table-success');
            });
            
            // Выделяем выбранную строку
            row.classList.add('table-success');
            
            // Открываем модальное окно
            selectedTutorId = tutorId;
            openOrderModal('tutor', tutorId);
        });
    });
}

/**
 * Отобразить пагинацию (требование 3.2.1)
 */
function renderPagination(type, totalPages, currentPage) {
    const container = document.getElementById(`${type}Pagination`);
    if (!container || totalPages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }
    
    let html = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a>
        </li>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a>
        </li>
    `;
    
    container.innerHTML = html;
    
    // Добавляем обработчики для кнопок пагинации
    container.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(link.dataset.page);
            
            if (type === 'courses') {
                const searchTerm = document.getElementById('courseSearch')?.value.toLowerCase() || '';
                const filteredCourses = window.allCourses.filter(course => 
                    course.name.toLowerCase().includes(searchTerm) || 
                    course.level.toLowerCase().includes(searchTerm)
                );
                renderCourses(filteredCourses, page);
            } else if (type === 'orders') {
                window.loadOrdersPage(page);
            }
        });
    });
}

/**
 * Открыть модальное окно для оформления заявки (требование 3.2.2)
 */
function openOrderModal(type, id) {
    const modalTitle = document.getElementById('modalTitle');
    const formContainer = document.getElementById('orderFormContainer');
    
    if (type === 'course') {
        const course = window.allCourses.find(c => c.id == id);
        if (!course) return;
        
        modalTitle.textContent = `Оформление заявки на курс: ${course.name}`;
        formContainer.innerHTML = generateCourseForm(course);
        setupCourseForm(course);
        
    } else if (type === 'tutor') {
        const tutor = window.allTutors.find(t => t.id == id);
        if (!tutor) return;
        
        modalTitle.textContent = `Оформление заявки на репетитора: ${tutor.name}`;
        formContainer.innerHTML = generateTutorForm(tutor);
        setupTutorForm(tutor);
    }
    
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    modal.show();
}

/**
 * Сгенерировать форму для курса (требование 3.3.3)
 */
function generateCourseForm(course) {
    // Форматируем даты из API
    const dateOptions = course.start_dates.map(date => {
        const dateValue = date.split('T')[0];
        const displayDate = new Date(date).toLocaleDateString('ru-RU');
        return `<option value="${dateValue}">${displayDate}</option>`;
    }).join('');
    
    // Рассчитываем общую продолжительность курса в часах
    const totalDuration = course.total_length * course.week_length;
    
    return `
        <form id="orderForm">
            <input type="hidden" name="course_id" value="${course.id}">
            <input type="hidden" name="tutor_id" value="0">
            <input type="hidden" name="duration" value="${totalDuration}">
            
            <div class="mb-3">
                <label class="form-label">Название курса (нередактируемое)</label>
                <input type="text" class="form-control" value="${course.name}" disabled>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Преподаватель (нередактируемое)</label>
                <input type="text" class="form-control" value="${course.teacher}" disabled>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Дата начала курса</label>
                <select name="date_start" class="form-select" required>
                    <option value="">Выберите дату</option>
                    ${dateOptions}
                </select>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Время занятий</label>
                <select name="time_start" class="form-select" required disabled>
                    <option value="">Сначала выберите дату</option>
                </select>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Количество студентов в группе (1-20)</label>
                <input type="number" name="persons" class="form-control" min="1" max="20" value="1" required>
            </div>
            
            <!-- Дополнительные параметры обучения (требование 3.3.5) -->
            <div class="mb-3">
                <h5>Дополнительные параметры обучения:</h5>
                <div class="row g-2">
                    <div class="col-md-6">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="supplementary" id="supplementary">
                            <label class="form-check-label" for="supplementary">Доп. материалы (+2000 ₽/студент)</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="personalized" id="personalized">
                            <label class="form-check-label" for="personalized">Индивидуальные занятия (+1500 ₽/неделя)</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="excursions" id="excursions">
                            <label class="form-check-label" for="excursions">Культурные экскурсии (+25%)</label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="assessment" id="assessment">
                            <label class="form-check-label" for="assessment">Оценка языка (+300 ₽)</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="interactive" id="interactive">
                            <label class="form-check-label" for="interactive">Интерактивная платформа (+50%)</label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Стоимость курса</label>
                <input type="text" class="form-control" id="priceField" value="0 ₽" disabled>
                <input type="hidden" name="price" id="hiddenPrice" value="0">
            </div>
            
            <button type="submit" class="btn btn-success w-100 mt-3">Отправить заявку</button>
        </form>
    `;
}

/**
 * Сгенерировать форму для репетитора (требование 3.3.3)
 */
function generateTutorForm(tutor) {
    const today = new Date().toISOString().split('T')[0];
    
    return `
        <form id="orderForm">
            <input type="hidden" name="tutor_id" value="${tutor.id}">
            <input type="hidden" name="course_id" value="0">
            
            <div class="mb-3">
                <label class="form-label">Дата начала занятий</label>
                <input type="date" name="date_start" class="form-control" min="${today}" required>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Время занятий</label>
                <select name="time_start" class="form-select" required>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="12:00">12:00</option>
                    <option value="15:00">15:00</option>
                    <option value="18:00">18:00</option>
                    <option value="19:00">19:00</option>
                </select>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Продолжительность занятий в часах (1-40)</label>
                <input type="number" name="duration" class="form-control" min="1" max="40" value="10" required>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Количество студентов (1-5)</label>
                <input type="number" name="persons" class="form-control" min="1" max="5" value="1" required>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Стоимость</label>
                <input type="text" class="form-control" id="tutorPriceField" value="${tutor.price_per_hour * 10} ₽" disabled>
                <input type="hidden" name="price" id="tutorHiddenPrice" value="${tutor.price_per_hour * 10}">
            </div>
            
            <button type="submit" class="btn btn-success w-100 mt-3">Отправить заявку</button>
        </form>
    `;
}

/**
 * Настроить форму для курса (требование 3.3.4)
 */
function setupCourseForm(course) {
    const form = document.getElementById('orderForm');
    const dateSelect = form.querySelector('[name="date_start"]');
    const timeSelect = form.querySelector('[name="time_start"]');
    const priceField = document.getElementById('priceField');
    const hiddenPrice = document.getElementById('hiddenPrice');
    
    // Заполняем время занятий в зависимости от выбранной даты (требование 3.3.3, п.4)
    dateSelect.addEventListener('change', function() {
        if (this.value) {
            timeSelect.disabled = false;
            timeSelect.innerHTML = '';
            
            // Фильтруем даты, соответствующие выбранной
            const selectedDates = course.start_dates.filter(date => 
                date.startsWith(this.value)
            );
            
            // Добавляем опции времени
            selectedDates.forEach(date => {
                const time = date.split('T')[1].substring(0, 5);
                timeSelect.innerHTML += `<option value="${time}">${time}</option>`;
            });
        } else {
            timeSelect.disabled = true;
            timeSelect.innerHTML = '<option value="">Сначала выберите дату</option>';
        }
    });
    
    // Рассчитываем стоимость при изменении параметров (требование 3.3.4)
    function calculatePrice() {
        const dateStart = dateSelect.value;
        const timeStart = timeSelect.value;
        const persons = parseInt(form.querySelector('[name="persons"]').value) || 1;
        
        // Получаем статус чекбоксов
        const supplementary = form.querySelector('[name="supplementary"]')?.checked || false;
        const personalized = form.querySelector('[name="personalized"]')?.checked || false;
        const excursions = form.querySelector('[name="excursions"]')?.checked || false;
        const assessment = form.querySelector('[name="assessment"]')?.checked || false;
        const interactive = form.querySelector('[name="interactive"]')?.checked || false;
        
        if (!dateStart || !timeStart) return;
        
        // Расчет стоимости по формуле из задания
        const courseFeePerHour = course.course_fee_per_hour;
        const durationInHours = course.total_length * course.week_length;
        const isWeekend = isDateWeekend(dateStart) ? 1.5 : 1;
        
        // Дополнительные сборы за время
        let morningSurcharge = 0;
        let eveningSurcharge = 0;
        const hour = parseInt(timeStart.split(':')[0]);
        if (hour >= 9 && hour < 12) morningSurcharge = 400;
        if (hour >= 18 && hour < 20) eveningSurcharge = 1000;
        
        // Базовая стоимость
        let total = ((courseFeePerHour * durationInHours * isWeekend) + morningSurcharge + eveningSurcharge) * persons;
        
        // Дополнительные параметры
        if (supplementary) total += 2000 * persons;
        if (personalized) total += 1500 * course.total_length;
        if (excursions) total *= 1.25;
        if (assessment) total += 300;
        if (interactive) total *= 1.5;
        
        // Автоматические параметры (требование 3.3.5, п.1-3)
        const now = new Date();
        const regDate = new Date(dateStart);
        const diffDays = Math.ceil((regDate - now) / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 30) total *= 0.9; // earlyRegistration
        if (persons >= 5) total *= 0.85; // groupEnrollment
        if (course.week_length >= 5) total *= 1.2; // intensiveCourse
        
        priceField.value = total.toLocaleString('ru-RU') + ' ₽';
        hiddenPrice.value = total;
    }
    
    form.querySelector('[name="date_start"]').addEventListener('change', calculatePrice);
    form.querySelector('[name="time_start"]').addEventListener('change', calculatePrice);
    form.querySelector('[name="persons"]').addEventListener('input', calculatePrice);
    form.querySelector('[name="supplementary"]').addEventListener('change', calculatePrice);
    form.querySelector('[name="personalized"]').addEventListener('change', calculatePrice);
    form.querySelector('[name="excursions"]').addEventListener('change', calculatePrice);
    form.querySelector('[name="assessment"]').addEventListener('change', calculatePrice);
    form.querySelector('[name="interactive"]').addEventListener('change', calculatePrice);
    
    // Отправка формы (требование 3.2.2)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Валидация обязательных полей
        if (!dateSelect.value || !timeSelect.value) {
            showNotification('Пожалуйста, выберите дату и время занятий', 'danger');
            return;
        }
        
        try {
            const formData = new FormData(form);
            const orderData = Object.fromEntries(formData);
            
            // Преобразуем числовые значения
            orderData.persons = parseInt(orderData.persons);
            orderData.price = parseInt(orderData.price);
            
            await window.createOrder(orderData);
            showNotification('Заявка успешно создана!', 'success');
            
            // Закрываем модальное окно
            const modal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
            modal.hide();
            
            // Сбрасываем форму
            form.reset();
            timeSelect.disabled = true;
            timeSelect.innerHTML = '<option value="">Сначала выберите дату</option>';
            priceField.value = '0 ₽';
            hiddenPrice.value = '0';
            
        } catch (error) {
            console.error('Ошибка при создании заявки:', error);
            showNotification(`Ошибка: ${error.message}`, 'danger');
        }
    });
}

/**
 * Настроить форму для репетитора
 */
function setupTutorForm(tutor) {
    const form = document.getElementById('orderForm');
    const durationInput = form.querySelector('[name="duration"]');
    const priceField = document.getElementById('tutorPriceField');
    const hiddenPrice = document.getElementById('tutorHiddenPrice');
    
    // Рассчитываем стоимость при изменении параметров
    function calculatePrice() {
        const duration = parseInt(durationInput.value) || 0;
        const persons = parseInt(form.querySelector('[name="persons"]').value) || 1;
        const total = duration * tutor.price_per_hour * persons;
        
        priceField.value = total.toLocaleString('ru-RU') + ' ₽';
        hiddenPrice.value = total;
    }
    
    durationInput.addEventListener('input', calculatePrice);
    form.querySelector('[name="persons"]').addEventListener('input', calculatePrice);
    
    // Отправка формы
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(form);
            const orderData = Object.fromEntries(formData);
            
            // Преобразуем числовые значения
            orderData.duration = parseInt(orderData.duration);
            orderData.persons = parseInt(orderData.persons);
            orderData.price = parseInt(orderData.price);
            
            await window.createOrder(orderData);
            showNotification('Заявка успешно создана!', 'success');
            
            // Закрываем модальное окно
            const modal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
            modal.hide();
            
            // Сбрасываем форму
            form.reset();
            
        } catch (error) {
            console.error('Ошибка при создании заявки:', error);
            showNotification(`Ошибка: ${error.message}`, 'danger');
        }
    });
}

/**
 * Проверить, является ли дата выходным днем (требование 3.3.4)
 */
function isDateWeekend(dateString) {
    const date = new Date(dateString);
    return date.getDay() === 0 || date.getDay() === 6; // Воскресенье или суббота
}

/**
 * Отобразить таблицу заявок в личном кабинете (требование 3.1)
 */
function renderOrdersTable(orders, startIndex) {
    const tbody = document.getElementById('ordersTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    orders.forEach((order, index) => {
        // Определяем название курса или репетитора
        let itemName = 'Неизвестно';
        
        if (order.course_id && order.course_id !== 0) {
            const course = window.allCourses.find(c => c.id == order.course_id);
            itemName = course ? course.name : 'Курс удален';
        } else if (order.tutor_id && order.tutor_id !== 0) {
            const tutor = window.allTutors.find(t => t.id == order.tutor_id);
            itemName = tutor ? tutor.name : 'Репетитор удален';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${startIndex + index}</td>
            <td>${itemName}</td>
            <td>${formatDate(order.date_start)}</td>
            <td>${order.price ? order.price.toLocaleString('ru-RU') + ' ₽' : '—'}</td>
            <td>
                <div class="d-flex flex-column flex-md-row gap-1">
                    <button class="btn btn-sm btn-info detail-btn" data-id="${order.id}">Подробнее</button>
                    <button class="btn btn-sm btn-warning edit-btn" data-id="${order.id}">Изменить</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${order.id}">Удалить</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Добавляем обработчики для кнопок (требование 3.2.3)
    tbody.querySelectorAll('.detail-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const orderId = btn.dataset.id;
            showOrderDetails(orderId);
        });
    });
    
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const orderId = btn.dataset.id;
            editOrder(orderId);
        });
    });
    
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const orderId = btn.dataset.id;
            confirmDeleteOrder(orderId);
        });
    });
}

/**
 * Отобразить детали заявки (требование 3.2.3)
 */
function showOrderDetails(orderId) {
    const order = window.orders.find(o => o.id == orderId);
    if (!order) return;
    
    let content = '<ul class="list-group">';
    
    // Общая информация
    content += `
        <li class="list-group-item"><strong>ID заявки:</strong> ${order.id}</li>
        <li class="list-group-item"><strong>Дата создания:</strong> ${formatDate(order.created_at)}</li>
    `;
    
    // Информация о курсе или репетиторе
    if (order.course_id && order.course_id !== 0) {
        const course = window.allCourses.find(c => c.id == order.course_id);
        if (course) {
            content += `
                <li class="list-group-item"><strong>Название курса:</strong> ${course.name}</li>
                <li class="list-group-item"><strong>Преподаватель:</strong> ${course.teacher}</li>
                <li class="list-group-item"><strong>Уровень:</strong> ${course.level}</li>
            `;
        }
    } else if (order.tutor_id && order.tutor_id !== 0) {
        const tutor = window.allTutors.find(t => t.id == order.tutor_id);
        if (tutor) {
            content += `
                <li class="list-group-item"><strong>Имя репетитора:</strong> ${tutor.name}</li>
                <li class="list-group-item"><strong>Язык:</strong> ${tutor.languages_offered.join(', ')}</li>
                <li class="list-group-item"><strong>Уровень:</strong> ${tutor.language_level}</li>
            `;
        }
    }
    
    // Параметры заявки
    content += `
        <li class="list-group-item"><strong>Дата начала:</strong> ${formatDate(order.date_start)}</li>
        <li class="list-group-item"><strong>Время занятий:</strong> ${order.time_start}</li>
        <li class="list-group-item"><strong>Стоимость:</strong> ${order.price ? order.price.toLocaleString('ru-RU') + ' ₽' : '—'}</li>
    `;
    
    content += '</ul>';
    
    document.getElementById('detailContent').innerHTML = content;
    
    const modal = new bootstrap.Modal(document.getElementById('detailModal'));
    modal.show();
}

/**
 * Отредактировать заявку (требование 3.2.3)
 */
function editOrder(orderId) {
    const order = window.orders.find(o => o.id == orderId);
    if (!order) return;
    
    window.currentOrderId = orderId;
    
    const modalTitle = document.querySelector('#editModal .modal-title');
    const formContainer = document.getElementById('editFormContainer');
    
    if (order.course_id && order.course_id !== 0) {
        const course = window.allCourses.find(c => c.id == order.course_id);
        if (!course) {
            showNotification('Курс не найден', 'danger');
            return;
        }
        
        modalTitle.textContent = `Редактирование заявки на курс: ${course.name}`;
        formContainer.innerHTML = generateEditCourseForm(course, order);
        setupEditCourseForm(course, order);
        
    } else if (order.tutor_id && order.tutor_id !== 0) {
        const tutor = window.allTutors.find(t => t.id == order.tutor_id);
        if (!tutor) {
            showNotification('Репетитор не найден', 'danger');
            return;
        }
        
        modalTitle.textContent = `Редактирование заявки на репетитора: ${tutor.name}`;
        formContainer.innerHTML = generateEditTutorForm(tutor, order);
        setupEditTutorForm(tutor, order);
    }
    
    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
}

/**
 * Сгенерировать форму для редактирования курса
 */
function generateEditCourseForm(course, order) {
    // Рассчитываем общую продолжительность курса в часах
    const totalDuration = course.total_length * course.week_length;
    
    return `
        <form id="editOrderForm">
            <input type="hidden" name="course_id" value="${course.id}">
            <input type="hidden" name="tutor_id" value="0">
            <input type="hidden" name="duration" value="${totalDuration}">
            
            <div class="mb-3">
                <label class="form-label">Название курса (нередактируемое)</label>
                <input type="text" class="form-control" value="${course.name}" disabled>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Преподаватель (нередактируемое)</label>
                <input type="text" class="form-control" value="${course.teacher}" disabled>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Дата начала курса</label>
                <select name="date_start" class="form-select" required>
                    <option value="">Выберите дату</option>
                    ${course.start_dates.map(date => {
                        const dateValue = date.split('T')[0];
                        const isSelected = order.date_start === dateValue ? 'selected' : '';
                        const displayDate = new Date(date).toLocaleDateString('ru-RU');
                        return `<option value="${dateValue}" ${isSelected}>${displayDate}</option>`;
                    }).join('')}
                </select>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Время занятий</label>
                <select name="time_start" class="form-select" required>
                    <option value="09:00" ${order.time_start === '09:00' ? 'selected' : ''}>09:00</option>
                    <option value="10:00" ${order.time_start === '10:00' ? 'selected' : ''}>10:00</option>
                    <option value="12:00" ${order.time_start === '12:00' ? 'selected' : ''}>12:00</option>
                    <option value="15:00" ${order.time_start === '15:00' ? 'selected' : ''}>15:00</option>
                    <option value="18:00" ${order.time_start === '18:00' ? 'selected' : ''}>18:00</option>
                    <option value="19:00" ${order.time_start === '19:00' ? 'selected' : ''}>19:00</option>
                </select>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Количество студентов в группе (1-20)</label>
                <input type="number" name="persons" class="form-control" min="1" max="20" value="${order.persons || 1}" required>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Стоимость курса</label>
                <input type="text" class="form-control" id="editPriceField" value="${order.price.toLocaleString('ru-RU')} ₽" disabled>
                <input type="hidden" name="price" id="editHiddenPrice" value="${order.price}">
            </div>
            
            <button type="submit" class="btn btn-warning w-100 mt-3">Сохранить изменения</button>
        </form>
    `;
}

/**
 * Сгенерировать форму для редактирования репетитора
 */
function generateEditTutorForm(tutor, order) {
    return `
        <form id="editOrderForm">
            <input type="hidden" name="tutor_id" value="${tutor.id}">
            <input type="hidden" name="course_id" value="0">
            
            <div class="mb-3">
                <label class="form-label">Дата начала занятий</label>
                <input type="date" name="date_start" class="form-control" value="${order.date_start}" required>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Время занятий</label>
                <select name="time_start" class="form-select" required>
                    <option value="09:00" ${order.time_start === '09:00' ? 'selected' : ''}>09:00</option>
                    <option value="10:00" ${order.time_start === '10:00' ? 'selected' : ''}>10:00</option>
                    <option value="12:00" ${order.time_start === '12:00' ? 'selected' : ''}>12:00</option>
                    <option value="15:00" ${order.time_start === '15:00' ? 'selected' : ''}>15:00</option>
                    <option value="18:00" ${order.time_start === '18:00' ? 'selected' : ''}>18:00</option>
                    <option value="19:00" ${order.time_start === '19:00' ? 'selected' : ''}>19:00</option>
                </select>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Продолжительность занятий в часах (1-40)</label>
                <input type="number" name="duration" class="form-control" min="1" max="40" value="${order.duration || 10}" required>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Количество студентов (1-5)</label>
                <input type="number" name="persons" class="form-control" min="1" max="5" value="${order.persons || 1}" required>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Стоимость</label>
                <input type="text" class="form-control" id="editTutorPriceField" value="${order.price.toLocaleString('ru-RU')} ₽" disabled>
                <input type="hidden" name="price" id="editTutorHiddenPrice" value="${order.price}">
            </div>
            
            <button type="submit" class="btn btn-warning w-100 mt-3">Сохранить изменения</button>
        </form>
    `;
}

/**
 * Настроить форму для редактирования курса
 */
function setupEditCourseForm(course, order) {
    const form = document.getElementById('editOrderForm');
    const dateSelect = form.querySelector('[name="date_start"]');
    const timeSelect = form.querySelector('[name="time_start"]');
    const priceField = document.getElementById('editPriceField');
    const hiddenPrice = document.getElementById('editHiddenPrice');
    
    // Рассчитываем стоимость при изменении параметров
    function calculatePrice() {
        const dateStart = dateSelect.value;
        const timeStart = timeSelect.value;
        const persons = parseInt(form.querySelector('[name="persons"]').value) || 1;
        
        if (!dateStart || !timeStart) return;
        
        // Расчет стоимости по формуле из задания
        const courseFeePerHour = course.course_fee_per_hour;
        const durationInHours = course.total_length * course.week_length;
        const isWeekend = isDateWeekend(dateStart) ? 1.5 : 1;
        
        // Дополнительные сборы за время
        let morningSurcharge = 0;
        let eveningSurcharge = 0;
        const hour = parseInt(timeStart.split(':')[0]);
        if (hour >= 9 && hour < 12) morningSurcharge = 400;
        if (hour >= 18 && hour < 20) eveningSurcharge = 1000;
        
        // Базовая стоимость
        let total = ((courseFeePerHour * durationInHours * isWeekend) + morningSurcharge + eveningSurcharge) * persons;
        
        priceField.value = total.toLocaleString('ru-RU') + ' ₽';
        hiddenPrice.value = total;
    }
    
    dateSelect.addEventListener('change', calculatePrice);
    timeSelect.addEventListener('change', calculatePrice);
    form.querySelector('[name="persons"]').addEventListener('input', calculatePrice);
    
    // Отправка формы
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(form);
            const orderData = Object.fromEntries(formData);
            
            // Преобразуем числовые значения
            orderData.persons = parseInt(orderData.persons);
            orderData.price = parseInt(orderData.price);
            
            await window.updateOrder(window.currentOrderId, orderData);
            showNotification('Заявка успешно обновлена!', 'success');
            
            // Закрываем модальное окно
            const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            modal.hide();
            
            // Обновляем данные в таблице
            window.loadOrdersPage(1);
            
        } catch (error) {
            console.error('Ошибка при обновлении заявки:', error);
            showNotification(`Ошибка: ${error.message}`, 'danger');
        }
    });
}

/**
 * Настроить форму для редактирования репетитора
 */
function setupEditTutorForm(tutor, order) {
    const form = document.getElementById('editOrderForm');
    const durationInput = form.querySelector('[name="duration"]');
    const priceField = document.getElementById('editTutorPriceField');
    const hiddenPrice = document.getElementById('editTutorHiddenPrice');
    
    // Рассчитываем стоимость при изменении параметров
    function calculatePrice() {
        const duration = parseInt(durationInput.value) || 0;
        const persons = parseInt(form.querySelector('[name="persons"]').value) || 1;
        const total = duration * tutor.price_per_hour * persons;
        
        priceField.value = total.toLocaleString('ru-RU') + ' ₽';
        hiddenPrice.value = total;
    }
    
    durationInput.addEventListener('input', calculatePrice);
    form.querySelector('[name="persons"]').addEventListener('input', calculatePrice);
    
    // Отправка формы
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(form);
            const orderData = Object.fromEntries(formData);
            
            // Преобразуем числовые значения
            orderData.duration = parseInt(orderData.duration);
            orderData.persons = parseInt(orderData.persons);
            orderData.price = parseInt(orderData.price);
            
            await window.updateOrder(window.currentOrderId, orderData);
            showNotification('Заявка успешно обновлена!', 'success');
            
            // Закрываем модальное окно
            const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            modal.hide();
            
            // Обновляем данные в таблице
            window.loadOrdersPage(1);
            
        } catch (error) {
            console.error('Ошибка при обновлении заявки:', error);
            showNotification(`Ошибка: ${error.message}`, 'danger');
        }
    });
}

/**
 * Подтвердить удаление заявки (требование 3.2.3)
 */
function confirmDeleteOrder(orderId) {
    window.currentOrderId = orderId;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
    
    document.getElementById('confirmDeleteBtn').onclick = async function() {
        try {
            await window.deleteOrder(orderId);
            showNotification('Заявка успешно удалена!', 'success');
            modal.hide();
            
            // Обновляем данные в таблице
            window.loadOrdersPage(1);
            
        } catch (error) {
            console.error('Ошибка при удалении заявки:', error);
            showNotification(`Ошибка: ${error.message}`, 'danger');
        }
    };
}

/**
 * Форматирование даты для отображения (требование 3.3.3)
 */
function formatDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

/**
 * Настроить поиск по курсам (требование 3.1)
 */
function setupCourseSearch(courses) {
    const searchInput = document.getElementById('courseSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filteredCourses = courses.filter(course => 
            course.name.toLowerCase().includes(term) || 
            course.level.toLowerCase().includes(term)
        );
        renderCourses(filteredCourses, 1);
    });
}

/**
 * Настроить фильтры для репетиторов (требование 3.3.1)
 */
function setupTutorFilters(tutors) {
    const languageSelect = document.getElementById('languageFilter');
    if (!languageSelect) return;
    
    // Получаем уникальные языки
    const languages = [...new Set(tutors.flatMap(tutor => tutor.languages_offered))];
    
    // Заполняем выпадающий список языками
    languageSelect.innerHTML = '<option value="">Все языки</option>';
    languages.forEach(language => {
        languageSelect.innerHTML += `<option value="${language}">${language}</option>`;
    });
    
    // Добавляем обработчики для фильтров
    ['languageFilter', 'levelFilter'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                const language = document.getElementById('languageFilter').value;
                const level = document.getElementById('levelFilter').value;
                renderTutors(tutors, { language, level });
            });
        }
    });
}

// Экспортируем функции для глобального использования (требование 2)
window.showNotification = showNotification;
window.renderCourses = renderCourses;
window.renderTutors = renderTutors;
window.renderPagination = renderPagination;
window.openOrderModal = openOrderModal;
window.renderOrdersTable = renderOrdersTable;
window.showOrderDetails = showOrderDetails;
window.editOrder = editOrder;
window.confirmDeleteOrder = confirmDeleteOrder;
window.setupCourseSearch = setupCourseSearch;
window.setupTutorFilters = setupTutorFilters;
window.formatDate = formatDate;
window.isDateWeekend = isDateWeekend;