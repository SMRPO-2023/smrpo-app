import {DateTime} from "luxon";

export default {
  methods: {
    formatDateTime(time) {
      return DateTime.fromISO(time).toFormat('dd. MM. yyyy HH:mm')
    },
    formatDate(time) {
      return DateTime.fromISO(time).toFormat('dd. MM. yyyy')
    },
    formatDateTimeFull(time) {
      return DateTime.fromISO(time).toLocaleString(DateTime.DATE_HUGE) + ', ' + DateTime.fromISO(time).toLocaleString(DateTime.TIME_SIMPLE);
    }
  }
}
