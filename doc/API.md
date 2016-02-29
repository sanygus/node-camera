
**init() excluded**


### photoShooter.js

* `on()` - включение фотографирования через опредлённый интервал (см. setInterval)
* `off()` - выключение фотографирования
* `setTimeout(timeout)` - установка задержки перед фотографированием (не интервал) (timeout целое - ms)
* `setResolution(width, height)` - установка разрешения для фотографирования (width, height - целое - px)
* `setQuality(quality)` - установка качества фотографирования (quality целое - от 0 до 100)
* `setInterval(interval)` - установка промежутка фотографирования (interval целое - ms)


### videoShooter.js

* `on()` - включение записи видео через опредлённый интервал (см. setInterval)
* `off()` - выключение записи видео
* `setResolution(width, height)` - установка разрешения для записи видео (width, height - целое - px)
* `setFramerate(fps)` - установка количества кадров в секунду при записи видео (fps - целое - frames/s)
* `setBitrate(bitrate)` - установка битрейта (bitrate - целое - bits/s) (1080p30 15Mbits/s) (пока при записи этот параметр не учитывается)
* `setTime(time)` - установка продолжительности записи видеофрагмента (time - целое - ms)
* `setInterval(interval)` - установка промежутка записи видеофрагментов (interval целое - ms)


### sensorSender.js

* `on()` - включение получения и отправки значений через опредлённый интервал (см. setInterval)
* `off()` - выключение получения и отправки значений
* `setInterval(interval)` - установка промежутка получения и отправки значений (interval целое - ms)


### staticticsSender.js

* `takeStat(object)` - пишет в базу объект (добавляя датувремя и флаг "не отправлен")
* `getStatistics(callback)` - callback получает err, docs. docs - массив объектов статистики отсортированные по дате по убыванию

### system.js

* `loadCamSettings(type, callback)` - Получает настройки из базы или по умолчанию. type - photo/video[/sensors], callback получает err, settings. settings - объект с настройками. 
* `saveCamSettings(type, settings)` - Сохраняет настройки в базу. type - photo/video[/sensors], settings - объект с настройками.
