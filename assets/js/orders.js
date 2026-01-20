/**
 * orders.js
 * Модуль для работы с заявками
 */

/**
 * Отправка формы заявки
 */
function submitOrder() {
    const orderId = document.getElementById('orderId').value;
    const isEditMode = !!orderId;
    
    // Сбор данных формы
    const orderData = collectOrderFormData();
    
    if (!orderData) {
        showNotification('Пожалуйста, заполните все обязательные поля', 'danger');
        return;
    }
    
    // Отправка данных на сервер
    if (isEditMode) {
        updateOrder(orderId, orderData);
    } else {
        createOrder(orderData);
    }
}

/**
 * Сбор данных из формы заявки
 * @returns {Object|null} - объект с данными заявки или null при ошибке
 */
function collectOrderFormData() {
    const orderType = document.querySelector('input[name="orderType"]:checked').value;
    const studentsNumber = parseInt(document.getElementById('studentsNumber').value);
    
    // Валидация количества студентов
    if (studentsNumber < 1 || studentsNumber > 20) {
        showNotification('Количество студентов должно быть от 1 до 20', 'danger');
        return null;
    }
    
    let duration = 0;
    
    // Определяем продолжительность в зависимости от типа заявки
    if (orderType === 'course') {
        const courseId = document.getElementById('selectedCourseId').value;
        if (courseId) {
            const course = allCourses.find(c => c.id == courseId);
            if (course) {
                duration = course.total_length; // Продолжительность курса в неделях
            }
        }
    } else {
        duration = parseInt(document.getElementById('durationHours').value) || 1;
    }
    
    const supplementary = document.getElementById('supplementary').checked;
    const personalized = document.getElementById('personalized').checked;
    const excursions = document.getElementById('excursions').checked;
    const assessment = document.getElementById('assessment').checked;
    const interactive = document.getElementById('interactive').checked;
    
    const data = {
        persons: studentsNumber,
        duration: duration, // ВСЕГДА отправляем поле duration
        supplementary: supplementary,
        personalized: personalized,
        excursions: excursions,
        assessment: assessment,
        interactive: interactive,
        price: parseInt(document.getElementById('totalPrice').textContent.replace(/\D/g, ''))
    };
    
    // Если выбран курс
    if (orderType === 'course') {
        const courseId = document.getElementById('selectedCourseId').value;
        const startDate = document.getElementById('startDate').value;
        const startTime = document.getElementById('startTime').value;
        
        if (!courseId || !startDate || !startTime) {
            showNotification('Пожалуйста, выберите курс, дату и время', 'danger');
            return null;
        }
        
        data.course_id = parseInt(courseId);
        data.date_start = startDate;
        data.time_start = startTime;
    } 
    // Если выбран репетитор
    else {
        const tutorId = document.getElementById('selectedTutorId').value;
        const tutorDate = document.getElementById('tutorDate').value;
        const tutorTime = document.getElementById('tutorTime').value;
        
        if (!tutorId || !tutorDate || !tutorTime) {
            showNotification('Пожалуйста, выберите репетитора, дату и время', 'danger');
            return null;
        }
        
        data.tutor_id = parseInt(tutorId);
        data.date_start = tutorDate;
        data.time_start = tutorTime;
    }
    
    return data;
}

/**
 * Создание новой заявки
 * @param {Object} orderData - данные заявки
 */
function createOrder(orderData) {
    const url = `${API_BASE_URL}/api/orders?api_key=${API_KEY}`;
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'Ошибка при создании заявки');
            });
        }
        return response.json();
    })
    .then(order => {
        showNotification('Заявка успешно создана!', 'success');
        
        // Закрытие модального окна
        const modal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
        modal.hide();
        
        // Сброс формы
        document.getElementById('orderForm').reset();
        
        // Обновление списка заявок в личном кабинете, если он открыт
        if (typeof loadUserOrders === 'function') {
            loadUserOrders();
        }
        
        // Обновление списка заявок в таблице, если находимся в личном кабинете
        if (document.getElementById('ordersTableBody')) {
            loadUserOrders();
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showNotification('Ошибка при создании заявки: ' + error.message, 'danger');
    });
}

/**
 * Обновление существующей заявки
 * @param {number} orderId - ID заявки
 * @param {Object} orderData - обновленные данные заявки
 */
function updateOrder(orderId, orderData) {
    const url = `${API_BASE_URL}/api/orders/${orderId}?api_key=${API_KEY}`;
    
    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'Ошибка при обновлении заявки');
            });
        }
        return response.json();
    })
    .then(order => {
        showNotification('Заявка успешно обновлена!', 'success');
        
        // Закрытие модального окна
        const modal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
        modal.hide();
        
        // Обновление списка заявок
        if (typeof loadUserOrders === 'function') {
            loadUserOrders();
        }
        
        // Обновление списка заявок в таблице, если находимся в личном кабинете
        if (document.getElementById('ordersTableBody')) {
            loadUserOrders();
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showNotification('Ошибка при обновлении заявки: ' + error.message, 'danger');
    });
}

// Добавление функции в глобальную область видимости
window.submitOrder = submitOrder;