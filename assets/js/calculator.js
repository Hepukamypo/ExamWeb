/**
 * calculator.js
 * Модуль для расчета стоимости курсов и занятий
 */

/**
 * Обновление расчета стоимости
 */
function updatePriceCalculation() {
    const orderType = document.querySelector('input[name="orderType"]:checked').value;
    
    if (orderType === 'course') {
        calculateCoursePriceFromForm();
    } else {
        calculateTutorPriceFromForm();
    }
}

/**
 * Расчет стоимости курса из формы
 */
function calculateCoursePriceFromForm() {
    const courseId = document.getElementById('selectedCourseId').value;
    const startDate = document.getElementById('startDate').value;
    const startTime = document.getElementById('startTime').value;
    const studentsNumber = parseInt(document.getElementById('studentsNumber').value) || 1;
    const supplementary = document.getElementById('supplementary').checked;
    const personalized = document.getElementById('personalized').checked;
    const excursions = document.getElementById('excursions').checked;
    const assessment = document.getElementById('assessment').checked;
    const interactive = document.getElementById('interactive').checked;
    
    if (!courseId || !startDate || !startTime) {
        document.getElementById('totalPrice').textContent = '0 ₽';
        document.getElementById('priceBreakdown').innerHTML = '';
        return;
    }
    
    // Получение данных о курсе
    const course = allCourses.find(c => c.id == courseId);
    if (!course) return;
    
    // Расчет стоимости
    const result = calculateCoursePrice(
        course, 
        startDate, 
        startTime, 
        studentsNumber,
        supplementary,
        personalized,
        excursions,
        assessment,
        interactive
    );
    
    // Отображение результата
    document.getElementById('totalPrice').textContent = result.totalPrice.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('priceBreakdown').innerHTML = result.breakdownHtml;
}

/**
 * Расчет стоимости занятия с репетитором из формы
 */
function calculateTutorPriceFromForm() {
    const tutorId = document.getElementById('selectedTutorId').value;
    const date = document.getElementById('tutorDate').value;
    const time = document.getElementById('tutorTime').value;
    const duration = parseInt(document.getElementById('durationHours').value) || 1;
    const studentsNumber = parseInt(document.getElementById('studentsNumber').value) || 1;
    const supplementary = document.getElementById('supplementary').checked;
    const personalized = document.getElementById('personalized').checked;
    const excursions = document.getElementById('excursions').checked;
    const assessment = document.getElementById('assessment').checked;
    const interactive = document.getElementById('interactive').checked;
    
    if (!tutorId || !date || !time) {
        document.getElementById('totalPrice').textContent = '0 ₽';
        document.getElementById('priceBreakdown').innerHTML = '';
        return;
    }
    
    // Получение данных о репетиторе
    const tutor = allTutors.find(t => t.id == tutorId);
    if (!tutor) return;
    
    // Расчет стоимости
    const result = calculateTutorPrice(
        tutor,
        date,
        time,
        duration,
        studentsNumber,
        supplementary,
        personalized,
        excursions,
        assessment,
        interactive
    );
    
    // Отображение результата
    document.getElementById('totalPrice').textContent = result.totalPrice.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('priceBreakdown').innerHTML = result.breakdownHtml;
}

/**
 * Расчет стоимости курса
 * @param {Object} course - объект курса
 * @param {string} startDate - дата начала в формате YYYY-MM-DD
 * @param {string} startTime - время начала в формате HH:MM
 * @param {number} studentsNumber - количество студентов
 * @param {boolean} supplementary - дополнительные материалы
 * @param {boolean} personalized - индивидуальные занятия
 * @param {boolean} excursions - культурные экскурсии
 * @param {boolean} assessment - оценка уровня
 * @param {boolean} interactive - доступ к онлайн-платформе
 * @returns {Object} - результат расчета
 */
function calculateCoursePrice(
    course, 
    startDate, 
    startTime, 
    studentsNumber,
    supplementary = false,
    personalized = false,
    excursions = false,
    assessment = false,
    interactive = false
) {
    // Базовая стоимость за час
    const courseFeePerHour = course.course_fee_per_hour;
    
    // Общая продолжительность курса в часах
    const durationInHours = course.total_length * course.week_length;
    
    // Определение выходного дня или праздника
    const date = new Date(startDate);
    const dayOfWeek = date.getDay(); // 0 (воскресенье) - 6 (суббота)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Воскресенье или суббота
    
    // Множитель для выходных и праздников
    const isWeekendOrHolidayMultiplier = isWeekend ? 1.5 : 1;
    
    // Доплата за утренние занятия (9:00-12:00)
    const [hours, minutes] = startTime.split(':').map(Number);
    const isMorning = hours >= 9 && hours < 12;
    const morningSurcharge = isMorning ? 400 : 0;
    
    // Доплата за вечерние занятия (18:00-20:00)
    const isEvening = hours >= 18 && hours < 20;
    const eveningSurcharge = isEvening ? 1000 : 0;
    
    // Базовая стоимость
    const baseCost = (courseFeePerHour * durationInHours * isWeekendOrHolidayMultiplier) + morningSurcharge + eveningSurcharge;
    
    // Расчет стоимости для всех студентов
    let totalCost = baseCost * studentsNumber;
    
    // Дополнительные опции
    const options = [];
    
    // Дополнительные материалы (+2000 ₽ на студента)
    if (supplementary) {
        const optionCost = 2000 * studentsNumber;
        totalCost += optionCost;
        options.push({
            name: 'Дополнительные материалы',
            cost: optionCost,
            description: `+2000 ₽ за каждого из ${studentsNumber} студентов`
        });
    }
    
    // Индивидуальные занятия (+1500 ₽ за неделю)
    if (personalized) {
        const optionCost = 1500 * course.total_length;
        totalCost += optionCost;
        options.push({
            name: 'Индивидуальные занятия',
            cost: optionCost,
            description: `+1500 ₽ за каждую из ${course.total_length} недель`
        });
    }
    
    // Культурные экскурсии (+25%)
    if (excursions) {
        const optionCost = totalCost * 0.25;
        totalCost += optionCost;
        options.push({
            name: 'Культурные экскурсии',
            cost: optionCost,
            description: '+25% от общей стоимости'
        });
    }
    
    // Оценка уровня (+300 ₽)
    if (assessment) {
        const optionCost = 300;
        totalCost += optionCost;
        options.push({
            name: 'Оценка уровня',
            cost: optionCost,
            description: '+300 ₽ за предварительную оценку'
        });
    }
    
    // Доступ к онлайн-платформе (+50%)
    if (interactive) {
        const optionCost = totalCost * 0.5;
        totalCost += optionCost;
        options.push({
            name: 'Доступ к онлайн-платформе',
            cost: optionCost,
            description: '+50% от текущей стоимости'
        });
    }
    
    // Формирование HTML для детализации
    let breakdownHtml = `
        <div class="small">
            <div class="d-flex justify-content-between">
                <span>Базовая стоимость (${durationInHours} ч × ${courseFeePerHour.toLocaleString('ru-RU')} ₽/ч):</span>
                <span>${(courseFeePerHour * durationInHours).toLocaleString('ru-RU')} ₽</span>
            </div>
    `;
    
    if (isWeekendOrHolidayMultiplier !== 1) {
        breakdownHtml += `
            <div class="d-flex justify-content-between">
                <span>Надбавка за выходные дни (${isWeekendOrHolidayMultiplier}x):</span>
                <span>+${((courseFeePerHour * durationInHours * (isWeekendOrHolidayMultiplier - 1))).toLocaleString('ru-RU')} ₽</span>
            </div>
        `;
    }
    
    if (morningSurcharge > 0) {
        breakdownHtml += `
            <div class="d-flex justify-content-between">
                <span>Доплата за утренние занятия:</span>
                <span>+${morningSurcharge.toLocaleString('ru-RU')} ₽</span>
            </div>
        `;
    }
    
    if (eveningSurcharge > 0) {
        breakdownHtml += `
            <div class="d-flex justify-content-between">
                <span>Доплата за вечерние занятия:</span>
                <span>+${eveningSurcharge.toLocaleString('ru-RU')} ₽</span>
            </div>
        `;
    }
    
    breakdownHtml += `
            <div class="d-flex justify-content-between mt-2 fw-bold">
                <span>Стоимость для одного студента:</span>
                <span>${baseCost.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div class="d-flex justify-content-between">
                <span>Количество студентов:</span>
                <span>${studentsNumber} чел.</span>
            </div>
            <div class="d-flex justify-content-between fw-bold mt-2">
                <span>Сумма до доп. опций:</span>
                <span>${(baseCost * studentsNumber).toLocaleString('ru-RU')} ₽</span>
            </div>
    `;
    
    if (options.length > 0) {
        breakdownHtml += '<div class="mt-2"><strong>Дополнительные опции:</strong></div>';
        
        options.forEach(option => {
            breakdownHtml += `
                <div class="d-flex justify-content-between">
                    <span>${option.name}:</span>
                    <span>+${Math.round(option.cost).toLocaleString('ru-RU')} ₽</span>
                </div>
                <div class="text-muted ps-3">${option.description}</div>
            `;
        });
    }
    
    breakdownHtml += `
        </div>
    `;
    
    return {
        totalPrice: Math.round(totalCost),
        breakdownHtml: breakdownHtml
    };
}

/**
 * Расчет стоимости занятия с репетитором
 * @param {Object} tutor - объект репетитора
 * @param {string} date - дата занятия в формате YYYY-MM-DD
 * @param {string} time - время занятия в формате HH:MM
 * @param {number} duration - продолжительность в часах
 * @param {number} studentsNumber - количество студентов
 * @param {boolean} supplementary - дополнительные материалы
 * @param {boolean} personalized - индивидуальные занятия
 * @param {boolean} excursions - культурные экскурсии
 * @param {boolean} assessment - оценка уровня
 * @param {boolean} interactive - доступ к онлайн-платформе
 * @returns {Object} - результат расчета
 */
function calculateTutorPrice(
    tutor,
    date,
    time,
    duration,
    studentsNumber,
    supplementary = false,
    personalized = false,
    excursions = false,
    assessment = false,
    interactive = false
) {
    // Почасовая ставка репетитора
    const pricePerHour = tutor.price_per_hour;
    
    // Определение выходного дня
    const dt = new Date(date);
    const dayOfWeek = dt.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Множитель для выходных
    const weekendMultiplier = isWeekend ? 1.5 : 1;
    
    // Базовая стоимость
    let baseCost = pricePerHour * duration * weekendMultiplier;
    
    // Доплата за утренние и вечерние занятия (аналогично курсам)
    const [hours, minutes] = time.split(':').map(Number);
    let timeSurcharge = 0;
    
    if (hours >= 9 && hours < 12) {
        timeSurcharge = 400;
    } else if (hours >= 18 && hours < 20) {
        timeSurcharge = 1000;
    }
    
    baseCost += timeSurcharge;
    
    // Расчет стоимости для всех студентов (обычно 1 для репетитора)
    let totalCost = baseCost * studentsNumber;
    
    // Дополнительные опции (аналогично курсам)
    const options = [];
    
    if (supplementary) {
        const optionCost = 2000 * studentsNumber;
        totalCost += optionCost;
        options.push({
            name: 'Дополнительные материалы',
            cost: optionCost,
            description: `+2000 ₽ за каждого из ${studentsNumber} студентов`
        });
    }
    
    if (personalized) {
        // Для репетитора индивидуальные занятия обычно уже включены в стоимость
        // Но добавим небольшую надбавку за персонализацию программы
        const optionCost = 500 * duration;
        totalCost += optionCost;
        options.push({
            name: 'Персонализация программы',
            cost: optionCost,
            description: `+500 ₽ за каждый из ${duration} часов`
        });
    }
    
    if (excursions) {
        const optionCost = totalCost * 0.25;
        totalCost += optionCost;
        options.push({
            name: 'Культурные экскурсии',
            cost: optionCost,
            description: '+25% от общей стоимости'
        });
    }
    
    if (assessment) {
        const optionCost = 300;
        totalCost += optionCost;
        options.push({
            name: 'Оценка уровня',
            cost: optionCost,
            description: '+300 ₽ за предварительную оценку'
        });
    }
    
    if (interactive) {
        const optionCost = totalCost * 0.5;
        totalCost += optionCost;
        options.push({
            name: 'Доступ к онлайн-платформе',
            cost: optionCost,
            description: '+50% от текущей стоимости'
        });
    }
    
    // Формирование HTML для детализации
    let breakdownHtml = `
        <div class="small">
            <div class="d-flex justify-content-between">
                <span>Почасовая ставка (${duration} ч × ${pricePerHour.toLocaleString('ru-RU')} ₽/ч):</span>
                <span>${(pricePerHour * duration).toLocaleString('ru-RU')} ₽</span>
            </div>
    `;
    
    if (weekendMultiplier !== 1) {
        breakdownHtml += `
            <div class="d-flex justify-content-between">
                <span>Надбавка за выходные (${weekendMultiplier}x):</span>
                <span>+${((pricePerHour * duration * (weekendMultiplier - 1))).toLocaleString('ru-RU')} ₽</span>
            </div>
        `;
    }
    
    if (timeSurcharge > 0) {
        const timeDesc = hours >= 9 && hours < 12 ? 'утренние занятия' : 'вечерние занятия';
        breakdownHtml += `
            <div class="d-flex justify-content-between">
                <span>Доплата за ${timeDesc}:</span>
                <span>+${timeSurcharge.toLocaleString('ru-RU')} ₽</span>
            </div>
        `;
    }
    
    breakdownHtml += `
            <div class="d-flex justify-content-between fw-bold mt-2">
                <span>Стоимость для одного студента:</span>
                <span>${baseCost.toLocaleString('ru-RU')} ₽</span>
            </div>
    `;
    
    if (studentsNumber > 1) {
        breakdownHtml += `
            <div class="d-flex justify-content-between">
                <span>Количество студентов:</span>
                <span>${studentsNumber} чел.</span>
            </div>
            <div class="d-flex justify-content-between fw-bold mt-2">
                <span>Сумма до доп. опций:</span>
                <span>${(baseCost * studentsNumber).toLocaleString('ru-RU')} ₽</span>
            </div>
        `;
    }
    
    if (options.length > 0) {
        breakdownHtml += '<div class="mt-2"><strong>Дополнительные опции:</strong></div>';
        
        options.forEach(option => {
            breakdownHtml += `
                <div class="d-flex justify-content-between">
                    <span>${option.name}:</span>
                    <span>+${Math.round(option.cost).toLocaleString('ru-RU')} ₽</span>
                </div>
                <div class="text-muted ps-3">${option.description}</div>
            `;
        });
    }
    
    breakdownHtml += `
        </div>
    `;
    
    return {
        totalPrice: Math.round(totalCost),
        breakdownHtml: breakdownHtml
    };
}

// Добавление функции в глобальную область видимости
window.updatePriceCalculation = updatePriceCalculation;