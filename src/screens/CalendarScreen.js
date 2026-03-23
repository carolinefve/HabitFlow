import { useState } from "react";
import { Modal,
         View,
         Text,
         StyleSheet,
         ScrollView,
         TouchableOpacity,
         TextInput
       } from "react-native";
import DatePicker, { getFormatedDate} from "react-native-modern-datepicker";
// import DatePicker from "react-native-date-picker";

export default function Calendar () {
  const now   = new Date();
  const [currentDate, setCurrentDate] = useState(now);
  const today = now.getDate(); // numerical number from 0-30
  const month = currentDate.getMonth(); // numerical number from 0-11
  const year  = currentDate.getFullYear(); // numerical number of the current year (e.g. 2017)

  const systemMonth = now.getMonth();

  const defaultDate = getFormatedDate(now, 'YYYY/MM/DD'); // used for setting the user selected date for each deadline

  var numDaysInMonth = getDaysInMonth(month, year); // function at the bottom
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7; // number of empty tiles before the month starts

  /*
    All calendar boxes before the start date are empty (null)
    A week has 7 days, maximum 6 weeks per month, therefore each calendar has 7x6 == 42 tiles
  */
  const calendarCells = [];
  for (var i = 0; i < startOffset; i++) // navigate to the first day in the month
    calendarCells.push(null);
  for (var i = 1; i <= numDaysInMonth; i++) // fill in the calendar
    calendarCells.push(i);
  while (calendarCells.length < 42) // fill the rest of the calendar
    calendarCells.push(null);

  /* Deadline Array */
  const [deadlines, setDeadlines] = useState([
    {
      id: 0,
      title: "Test 1",
      description: "This is some sample text",
      date: new Date(2026, 2, 20, 23, 59), // 2026, March 20th 11:59:00 PM
      condition: false,
    },
    {
      id: 1,
      title: "Test 2",
      description: "This is some sample text",
      date: new Date(2026, 2, 23, 23, 59),
      condition: false,
    },
    {
      id: 2,
      title: "Test 3",
      description: "This is some sample text",
      date: new Date(2026, 2, 19, 23, 59),
      condition: false,
    },
  ]);
  /* Helper function for generating red dots that indicate a date on the calendar has a deadline */
  function hasDeadline(day) {
    return deadlines.some(deadline => {
      const deadlineDate = new Date(deadline.date);
      return (
        !deadline.condition &&
        deadlineDate.getDate() === day &&
        deadlineDate.getMonth() === month &&
        deadlineDate.getFullYear() === year
      );
    }); 
  }
  /* Helper functions for sorting the deadlines */
  const filteredDeadlines = selectedDay ? deadlines.filter((item) => {
      const d = new Date(item.date);
      return (
        d.getDate() === Number(selectedDay) &&
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    })
  : deadlines;

  const sortedDeadlines = [...filteredDeadlines].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  /* Selection Constants */
  const [selectedDay, setSelectedDay]           = useState();     // for selecting a day from the calendar
  const [selectedDeadline, setSelectedDeadline] = useState(null); // for opening deadline details
  const [title, setTitle]                       = useState("");   // for editing / creating deadline titles
  const [description, setDescription]           = useState("");   // for editing / creating deadline descriptions
  const [date, setDate]                         = useState(defaultDate); // for editing / creating deadline due dates
  const [time, setTime]                         = useState("12:00");     // for editing / creating deadline due time
  /* UI Constants */
  const [modalVisible, setModalVisible]         = useState(false);
  const [showDatePicker, setShowDatePicker]     = useState(false);
  const [showTimePicker, setShowTimePicker]     = useState(false);

  /* Main Return Call */
  return (
    <View style={{flex: 1, paddingTop: 10, alignItems: 'center', backgroundColor: '#282b4d'}}>
      {/* General UI */}
      <View style={{marginBottom: 10}}>
        <Text style={{fontSize: 22, fontWeight: 'bold', color: 'white'}}>
          {monthName(month)}
        </Text>
      </View>

      <TouchableOpacity
        style={{position: 'absolute', top: 15, left: 7.5}}
        onPress={() => {
          const newDate = new Date(year, month-1, 1); // next month is minus one
          setCurrentDate(newDate);
          setSelectedDay();
        }}
      >
        <Text style={{fontSize: 18, fontWeight: 'bold', color: 'white'}}>
          Prev
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{position: 'absolute', top: 15, right: 7.5}}
        onPress={() => {
          const newDate = new Date(year, month+1, 1); // next month is plus one
          setCurrentDate(newDate);
          setSelectedDay();
        }}
      >
        <Text style={{fontSize: 18, fontWeight: 'bold', color: 'white'}}>
          Next
        </Text>
      </TouchableOpacity>

      <View style={{width: '95%', aspectRatio: 1.2, flexDirection: 'row', flexWrap: 'wrap'}}>
        {calendarCells.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              {
                width: '14.28571429%',
                height: '16.66666667%',
                aspectRatio: 1,
                borderWidth: 1,
                borderColor: '#181821',
                backgroundColor: '#21225d',
                justifyContent: 'center',
                alignItems: 'center'
              },
              day === today && systemMonth === month? {backgroundColor: '#902d2d'} : null,
              day === selectedDay ? {backgroundColor: '#1984ff'} : null
            ]}
            onPress={() => day === selectedDay ? setSelectedDay() : day && setSelectedDay(day)}
            // if the current day is the selected day, selecteday becomes empty
            // else set the selected day to the current day
          >
            {day && (
              <>
                {hasDeadline(day) && (
                  <View style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'red',
                    marginTop: 2
                  }} />
                )}
                <Text style={{color: 'white'}}>{day}</Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Generate Deadline Cards */}
      <ScrollView style={{width: '95%', marginTop: 10}}>
        <Text style={{color: 'white', textAlign: 'center', marginTop: 10, fontWeight: 'bold'}}>
          {selectedDay
            ? `Showing deadlines for ${selectedDay}`
            : "Showing all deadlines"}
        </Text>
        {/* Map deadlines */}
        {sortedDeadlines.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[{
              width: '100%',
              height: 'auto',
              marginTop: 15,
              padding: 15,
              borderRadius: 8,
              backgroundColor: '#271540',
            },
            item.condition && {
              opacity: 0.5,
              backgroundColor: '#555',
            },
            ]}
            onPress={() => setSelectedDeadline(item)}
          >
            {/* Text on the deadline cards */}
            <View>
              <Text style={{fontWeight: 'bold', marginBottom: 5, color: 'white'}} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={{fontWeight: 'regular', color: 'white'}} numberOfLines={1}>
                Due: {item?.date?.toLocaleString([], {
                  year: 'numeric', month: 'long', day: 'numeric',
                  hour: '2-digit', minute: '2-digit', hour12: true,
                })}
              </Text>
            </View>

            <Modal visible={selectedDeadline !== null} transparent={true} animationType="slide">
              <View style={styles.modalBackground}>
                <View style={styles.modalCard}>
                  
                  <View>
                    <Text style={[
                      {fontSize: 20, fontWeight: 'bold'},
                      {marginLeft: 10},
                      {marginRight: 10},
                      {marginTop: 20},
                      {color: 'white'}
                    ]}>
                      Due: {selectedDeadline?.date?.toLocaleString([], {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: true,
                      })}
                    </Text>
                    <Text style={[
                      {fontSize: 20, fontWeight: 'bold'},
                      {marginLeft: 10},
                      {marginRight: 10},
                      {marginTop: 20},
                      {marginBottom: 20},
                      {color: 'white'}
                    ]}>
                      {selectedDeadline?.title}
                    </Text>

                    <Text style={[
                      {marginLeft: 10},
                      {marginRight: 10},
                      {color: 'white'}
                    ]}>
                      {selectedDeadline?.description}
                    </Text>
                  </View>

                  {/* Close button */}
                  <TouchableOpacity
                    style={[
                      buttonStyles.textButton,
                      positionStyles.bottomLeft,
                    ]}
                    onPress={() => {
                      setSelectedDeadline(null);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[{color: 'white'}, textStyles.uiText20]}>Close</Text>
                  </TouchableOpacity>

                  {/* Complete button */}
                  <TouchableOpacity
                    style={[
                      buttonStyles.textButton,
                      positionStyles.bottomRight,
                    ]}
                    onPress={() => {
                      setDeadlines(prev => 
                        prev.map(item =>
                          item.id === selectedDeadline.id ? {...item, condition: true} : item
                        )
                      );
                      
                      setSelectedDeadline(null);
                    }
                  }>
                    <Text style={[{color: 'white'}, textStyles.uiText20]}>Complete</Text>
                  </TouchableOpacity>

                </View>
              </View>

            </Modal>

          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add deadline button */}
      <TouchableOpacity
        style={[buttonStyles.circleButtonBlue, positionStyles.bottomRight]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[{color: 'white'}, textStyles.uiText30]}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <View>
              {/* Title of the window */}
              <Text style={[{color: 'white'}, textStyles.uiText30]}>Create a New Event</Text>

              {/* Set deadline title */}
              <View style={[styles.tile]}>
                <TextInput 
                  style={[{color: 'white'}, textStyles.uiText20]}
                  placeholder="Title"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* Set deadline description */}
              <View style={[styles.tile, {height: '25%'}]}>
                <TextInput 
                  style={[textStyles.uiText16, {color: 'white'}]}
                  placeholder="Description"
                  value={description}
                  onChangeText={setDescription}
                  multiline={true}
                />
              </View>
            
              {/* Set deadline date */}
              <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)}>
                <View style={styles.tileSmall}>
                  <Text style={[textStyles.uiText16, {color: 'white'}]}>
                    Date: {date}
                  </Text>
                </View>
              </TouchableOpacity>
              {showDatePicker && (
                <DatePicker
                  style={{height: '0%'}} // changes how much the "description" section expands
                  mode='calendar'
                  isGregorian={true}
                  selected={defaultDate}
                  minimumDate={defaultDate}
                  onDateChange={setDate}
                  onSelectedChange={(selectedDate) => setDate(selectedDate)}
                  options={{
                    backgroundColor: '#1c1c1f',
                    textHeaderColor: '#fff',
                    textDefaultColor: '#fff',
                    selectedTextColor: '#fff',
                    mainColor: '#1984ff',
                    textSecondaryColor: '#aaa',
                    borderColor: '#333',
                  }}
                />
              )}

              {/* Set deadline time */}
              <TouchableOpacity onPress={() => setShowTimePicker(!showTimePicker)}>
                <View style={styles.tileSmall}>
                  <Text style={[textStyles.uiText16, {color: 'white'}]}>
                    Time: {time}
                  </Text>
                </View>
              </TouchableOpacity>
              {showTimePicker && (
                <DatePicker
                  style={{height: '0%'}} // changes how much the "description" section expands
                  mode="time"
                  isGregorian={true}
                  onTimeChange={setTime}
                  onSelectedChange={(selectedTime) => setTime(selectedTime)}
                  options={{
                    backgroundColor: '#1c1c1f',
                    textHeaderColor: '#fff',
                    textDefaultColor: '#fff',
                    selectedTextColor: '#fff',
                    mainColor: '#1984ff',
                    textSecondaryColor: '#aaa',
                    borderColor: '#333',
                  }}
                />
              )}
            </View>

            {/* "Add" button */}
            <TouchableOpacity
              style={[buttonStyles.textButton, positionStyles.bottomRight]}
              onPress={() => {
                const [year, month, day] = date.split('/').map(Number);
                const [hour, minute]     = time.split(':').map(Number);

                const combinedDate = new Date(year, month-1, day, hour, minute); // convert to a Date object
                const newDeadLine = {
                  id: Date.now(),
                  title,
                  description,
                  date: combinedDate,
                };

                setDeadlines([...deadlines, newDeadLine]);
                setTitle("");
                setDescription("");
                setDate(defaultDate);
                setTime("12:00");
                setModalVisible(false);
                setShowDatePicker(false);
                setShowTimePicker(false);
              }}
            >
              <Text style={[{color: 'white'}, textStyles.uiText20]}>Add</Text>
            </TouchableOpacity>

            {/* "Cancel" button */}
            <TouchableOpacity
              style={[buttonStyles.textButton, positionStyles.bottomLeft]}
              onPress={() => {
                setTitle("");
                setDescription("");
                setDate(defaultDate);
                setModalVisible(false);
                setShowDatePicker(false);
                setShowTimePicker(false);
              }}
            >
              <Text style={[{color: 'white'}, textStyles.uiText20]}>Cancel</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>



    </View>
  )
}

const styles = StyleSheet.create ({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  modalCard: {
    width: '100%',
    height: '90%',
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#2e2e2eee',
  },

  tile: {
    width: '100%',
    height: 'auto',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#1c1c1f'
  },

  tileSmall: {
    width: '50%',
    height: 'auto',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#1c1c1f'
  }
})

const textStyles = StyleSheet.create ({
  uiText30: {
    fontWeight: 'bold',
    fontSize: 30,
    textAlign: 'center',
    textAlignVertical: 'center',
  },

  uiText20: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
  },

  uiText16: {
    fontWeight: 'regular',
    fontSize: 16,
    textAlign: 'left',
    textAlignVertical: 'top'
  }

})

const buttonStyles = StyleSheet.create ({
    circleButtonBlack: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#2a2d31',
      justifyContent: 'center',
      alignItems: 'center'
    },

    circleButtonBlue: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#2383ff',
      justifyContent: 'center',
      alignItems: 'center'
    },

    circleButtonRed: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#e24a4a',
      justifyContent: 'center',
      alignItems: 'center'
    },

    textButton: {
      height: 50,
      paddingHorizontal: 16,
      borderRadius: 25,
      backgroundColor: '#161f2a',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: "flex-start",
    }
})

const positionStyles = StyleSheet.create ({
    topLeft: {
      position: 'absolute',
      top: 15,
      left: 7.5,
    },

    topRight: {
      position: 'absolute',
      top: 15,
      right: 7.5,
    },

    bottomLeft: {
      position: 'absolute',
      bottom: 20,
      left: 20,
    },

    bottomRight: {
      position: 'absolute',
      bottom: 20,
      right: 20,
    },
})

// ===== Helper Functions =====
function getDaysInMonth (month, year) {
  var numDaysInMonth = 0;
  switch (month) {
    case 0:  // Janurary
    case 2:  // March
    case 4:  // May
    case 6:  // July
    case 7:  // August
    case 9:  // October
    case 11: // December
      numDaysInMonth = 31;
      break;

    case 3:  // April
    case 5:  // June
    case 8:  // September
    case 10: // November
      numDaysInMonth = 30;
      break;

    case 1:  // Feburary
      if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
        numDaysInMonth = 29;
      }
      else {
        numDaysInMonth = 28;
      }
      break;

    default:
      return "Invalid Month";
  }

  return numDaysInMonth;
}

function monthName (index) {
  switch (index) {
    case 0:
      return "Janurary";
    case 1:
      return "Feburary";
    case 2:
      return "March";
    case 3:
      return "April";
    case 4:
      return "May";
    case 5:
      return "June";
    case 6:
      return "July";
    case 7:
      return "August";
    case 8:
      return "September";
    case 9:
      return "October";
    case 10:
      return "November";
    case 11:
      return "December";
    default:
      return "Invalid Month Index";
  }
}