import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { DateTimePicker } from '@react-native-community/datetimepicker';

export default function Calendar () {
  // ===== Date/Time Variables =====
  const now   = new Date();
  const today = now.getDate();
  const month = now.getMonth();
  const year  = now.getFullYear();

  // ===== Calendar Variables =====
  var numDaysInMonth = getDaysInMonth(month, year)
  const startOffset = (new Date(year, month, 1).getDay()+6) % 7;

  const calendarCells = [];
  // All calendar boxes before the start date are blank
  for (var i = 0; i < startOffset; i++)
    calendarCells.push(null);
  for (var i = 1; i <= numDaysInMonth; i++)
    calendarCells.push(i);
  // A week has 7 days, maximum 6 weeks per week, therefore 7x6 == 42
  while (calendarCells.length < 42)
    calendarCells.push(null);

  // ===== UI Elements =====
  const [modalVisible, setModalVisible] = useState(false);

  // ===== Deadline Elements =====
  const [deadlines, setDeadlines] = useState([
    {
      id: 0,
      title: "Test 1",
      description: "This is some sample text",
      date: new Date(2026, 2, 20, 23, 59), // 2026, March 20th
    },
    {
      id: 1,
      title: "Test 2",
      description: "This is some sample text",
      date: new Date(2026, 2, 23, 23, 59),
    },
    {
      id: 2,
      title: "Test 3",
      description: "This is some sample text",
      date: new Date(2026, 2, 19, 23, 59),
    },
  ]);

  function hasDeadline(day) {
    return deadlines.some(deadline => {
      const deadlineDate = new Date(deadline.date);
      return (
        deadlineDate.getDate() === day &&
        deadlineDate.getMonth() === month &&
        deadlineDate.getFullYear() === year
      );
    });
  }

  const filteredDeadlines = selectedDay ? deadlines.filter(deadline => {
    const deadlineDate = new Date(deadline.date);
    return (
      deadlineDate.getDate() === selectedDay &&
      deadlineDate.getMonth() === month &&
      deadlineDate.getFullYear() === year
    );
  }) : deadlines;

  const [selectedDay, setSelectedDay] = useState();

  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate]               = useState(new Date());

  const [selectedDeadline, setSelectedDeadline] = useState(null);

  // ===== Date Input Items =====
  const [selectedMonth, setSelectedMonth] = useState(0);
  <Picker
    selectedValue={selectedMonth}
    onValueChange={(itemValue) => setSelectedMonth(itemValue)}
  >
    <Picker.Item label="Janurary" value={0} />
    <Picker.Item label="February" value={1} />
    <Picker.Item label="March" value={2} />
    <Picker.Item label="April" value={3} />
    <Picker.Item label="May" value={4} />
    <Picker.Item label="June" value={5} />
    <Picker.Item label="July" value={6} />
    <Picker.Item label="August" value={7} />
    <Picker.Item label="September" value={8} />
    <Picker.Item label="October" value={9} />
    <Picker.Item label="November" value={10} />
    <Picker.Item label="December" value={11} />
  </Picker>
  const [inputYear, setInputYear] = useState(2026);
  const [inputMonth, setInputMonth] = useState(2);
  const [inputDay, setInputDay] = useState(20);
  const [inputHour, setInputHour] = useState(12);
  const [inputMinute, setInputMinute] = useState(0);
  const newDate = new Date(
    inputYear,
    inputMonth,
    inputDay,
    inputHour,
    inputMinute
  );

  <DateTimePicker
    value={date}
    mode="datetime"
    onChange={(event, selectedDate) => setDate(selectedDate)}
  />

  return (
    <View style={styles.container}>

      <View style={textStyles.header}>
        <Text style={textStyles.monthText}>
          {monthName(month)}
        </Text>
      </View>

      <View style={positionStyles.topLeft}>
        <Text style={textStyles.switchMonthText}>
          Prev
        </Text>
      </View>

      <View style={positionStyles.topRight}>
        <Text style={textStyles.switchMonthText}>
          Next
        </Text>
      </View>

      <View style={calendarStyles.calendar}>
        {calendarCells.map((day, index) => (
          <TouchableOpacity
            key={index} 
            style = {[
              calendarStyles.dates,
              day === today ? {backgroundColor: '#ec9c9c'} : null,
              day === selectedDay ? {backgroundColor: '#90c4ff'} : null
            ]}
            onPress={() => day === selectedDay ? setSelectedDay() : day && setSelectedDay(day)}
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
                <Text>{day}</Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Generate Deadline Cards */}
      {/* Tap a Deadline --> Show Details */}
      <ScrollView style={cardStyles.cardList}>
        {filteredDeadlines.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={cardStyles.card}
            onPress={() => setSelectedDeadline(item)}
          >
          <View>
            <Text style={textStyles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text numberOfLines={1}>
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
                    ]}>
                      {selectedDeadline?.title}
                    </Text>

                    <Text style={[
                      {marginLeft: 10},
                      {marginRight: 10},
                    ]}>
                      {selectedDeadline?.description}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      buttonStyles.textButton,
                      positionStyles.bottomLeft,
                    ]}
                    onPress={() => {
                      setSelectedDeadline(null);
                      setModalVisible(false);
                    }
                  }>
                    <Text style={[{color: 'white'}, textStyles.uiTextSmall]}>Close</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      buttonStyles.textButton,
                      positionStyles.bottomRight,
                    ]}
                    onPress={() => {
                      setSelectedDeadline(null);
                      setModalVisible(false);
                    }
                  }>
                    <Text style={[{color: 'white'}, textStyles.uiTextSmall]}>Edit</Text>
                  </TouchableOpacity>

                </View>
              </View>

            </Modal>

          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* UI Elements */}
      <TouchableOpacity
        style={[buttonStyles.circleButtonBlack, positionStyles.bottomRight]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[{color: 'white'}, textStyles.uiText]}>+</Text>
      </TouchableOpacity>

      {/* Floating Window for Creating a new Deadline */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>

            <Text style={textStyles.uiText}>Create a New Event</Text>

            <View style={[styles.tile]}>
              <TextInput 
                style={[{color: 'white'}, textStyles.uiText]}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={[styles.tile]}>
              <TextInput 
                style={[{color: 'white'}, textStyles.uiText]}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View style={[styles.tile]}>
              <TextInput 
                style={[{color: 'white'}, textStyles.uiText]}
                placeholder="Enter Date"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <TouchableOpacity
              style={[buttonStyles.textButton, positionStyles.bottomLeft]}
              onPress={() => {
                const newDeadLine = {
                  id: Date.now(),
                  title,
                  description,
                  date: newDate,
                };

                setDeadlines([...deadlines, newDeadLine]);
                setModalVisible(false);
              }}
            >
              <Text style={[{color: 'white'}, textStyles.uiText]}>Back</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* Tap a Deadline --> Show Details */}
      

    </View>
  )
}

const styles = StyleSheet.create ({
    container: {
      flex: 1,
      paddingTop: 10,
      alignItems: 'center',
      backgroundColor: '#fff'
    },

    modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },

    modalCard: {
      width: '100%',
      height: '95%',
      padding: 10,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: 'white'
    },

    tile: {
      width: '100%',
      height: '10%',
      marginTop: 15,
      padding: 15,
      borderRadius: 8,
      backgroundColor: '#b4c5db'
    },
})

const calendarStyles = StyleSheet.create ({
    calendar: {
      width: '95%',
      aspectRatio: 1.2,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    dates: {
      width: '14.28571429%',
      height: '16.66666667%',
      aspectRatio: 1,
      borderWidth: 1,
      borderColor: '#ddd',
      backgroundColor: '#eee',
      justifyContent: 'center',
      alignItems: 'center'
    },
})

const cardStyles = StyleSheet.create ({
    card: {
      width: '100%',
      height: 'auto',
      marginTop: 15,
      padding: 15,
      borderRadius: 8,
      backgroundColor: '#b4c5db',
    },

    cardList: {
      width: '95%',
      marginTop: 10,
    },

    cardTitle: {
      fontWeight: 'bold',
      marginBottom: 5
    },
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
      backgroundColor: '#2a2d31',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: "flex-start",
    }
})

const textStyles = StyleSheet.create ({
    header: {
      marginBottom: 10,
    },
  
    monthText: {
      fontSize: 22,
      fontWeight: 'bold',
    },

    switchMonthText: {
      fontSize: 18,
      fontWeight: 'bold',
    },

    uiText: {
      fontWeight: 'bold',
      fontSize: 30,
      textAlign: 'center',
      textAlignVertical: 'center',
    },

    uiTextSmall: {
      fontWeight: 'bold',
      fontSize: 20,
      textAlign: 'center',
      textAlignVertical: 'center',
    },

    uiTextSmallLeft: {
      fontWeight: 'regular',
      fontSize: 18,
      textAlign: 'left',
      textAlignVertical: 'center',
    },

    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10
    },

    deadlineDeatils: {
      fontSize: 16,
      fontWeight: 'bold',
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