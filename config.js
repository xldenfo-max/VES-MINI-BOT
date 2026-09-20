const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "KnightBot!H4sIAAAAAAAAA5WU3ZKiSBCF36VuNQb5UYGIjhgaBBRUUEFlYy5KKbAEAYtCwAnffQN7erovdmd774oETn6ZJ7N+gizHJbJQC+SfoCD4BinqjrQtEJDBaxVFiIA+CCGFQAb5st0rhsj41fiu9CK1SCytFlpXLTYbfrSPlM0m9SyGu3vuC3j0QVEdUnz8g2CqJEKWu8Zlwx1C1q/nnDKbT6YLSczDfWBxFG7veTpy8Xb/Ah6dIsQEZ/GkOKELIjC1UOtATL6Gv7W21mzdste1Y7GBWe55dqZ5xSqm1Cla5GVBHTdhnM3T+Gv4V2itlrN0uBLMOhGzVTOZjS+nuzhRj4oyZIRZPJ8ZiTA74/wNv8RxhsJpiDKKafvlvruT+1I5tfc7MQ1+bUi2b6/Cw9gS1+wgwAWrTEpz5fuqaYhfAz+KNHplXFoxRhKOrIw3h9ZO703CfLgNxijeSjrrJrHOcPPP4A55n5Xk//Qd2pubPuW2t4toR3WVuJ4YJvqBSSU7t5c+gWtz7M8WY9ucfA0fD7TUIlUa2zVGuHFHpjiezujcjo/BWWwzSxuTykLhiE0+8CGtyJ8ol5o9OEXB9STUBuMenCQUWbYHlbOt6brARu1Cm2li0SjtMk52NxquBkZiNCPPW6DMDC6Cas73kX9tgjZpJGbJa2GuuS/PihLUTkMgs48+ICjGJSWQ4jzrYhzbBzC8rdGRIPrsLhA8Eu0T1u6VTrORdq8nfS2wNc+y3mx6iIbXZTDB7Grtq9X8BfRBQfIjKksUmrikOWnnqCxhjEog//WjDzLU0Dffumw82wcRJiX1sqpIcxi+m/r+Eh6PeZXRdZsd1e6ACJAHH2FEKc7ismtjlUFyPOEbUk+QlkCOYFqi3wUigkIgU1Kh30ur5mHXd40T1q+qoIA+uDz9wCGQgSSMWV5gRU4U5eH38lvdicKi+JYhCvogg9234BYfQB+kzz+GnCQMRhw3FFlJGsvD71348Ru1Uw4RhTgtgQzUOUbX/d6YWFvuJnmGobixosYdxHtp7yPy5sFZzK2rFGxZdrCaHuKbFKR04+hNr9ye1Zke7wJTEw6byzX1Xv5BpOOL7oip6/uiXGq8UWa93ObFxS0dKNNG4gwcWElmuYO9aBqjnZ/zxr3O4DCdOrzv8gd9t7nbVxYGrj+ciygJTrsxtrX4pcsWohs+os/JenedONKF90mjkeXOZEbQEv344GnkNcaRs3LGto6doXcuW23UWLShnnNpGU1RlujaU3v6CvtVopy5YnPKlwXh0UKt34b3uTzpr0sLP+eqM617jDB63gG/7PkPE9+wu0kbPPqfFH7dKf+yl697xlKvt61Pw3CyNgSb2QYH794cI6LnNV7tdW5V94zB8Fr44PH40QdFCmmUkwuQQXk5QNAHJK+6uZ1mUf6HTKriTTU3XndFp7CkyscubPAFlRReCiCzY1GSBpI4EB5/Ax7dpfRABwAA",
MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || "https://files.catbox.moe/80d5w9.png",
AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true",
ADMIN_EVENTS: process.env.ADMIN_EVENTS || "false",
WELCOME: process.env.WELCOME || "false",
GOODBYE: process.env.GOODBYE || "false",
AUTO_VOICE: process.env.AUTO_VOICE || "false",
AUTO_REPLY: process.env.AUTO_REPLY || "false",
ANTI_LINK: process.env.ANTI_LINK || "true",
ANTI_BAD: process.env.ANTI_BAD || "false",
AUTO_TYPING: process.env.AUTO_TYPING || "false",
AUTO_RECORDING: process.env.AUTO_RECORDING || "false",
PREFIX: process.env.PREFIX || ".",
READ_MESSAGE: process.env.READ_MESSAGE || "false",
AUTO_REACT: process.env.AUTO_REACT || "false",
MODE: process.env.MODE || "public",
ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "true",
PUBLIC_MODE: process.env.PUBLIC_MODE || "true",
READ_CMD: process.env.READ_CMD || "false",
DEV: process.env.DEV || "94740544995",
ANTI_VV: process.env.ANTI_VV || "true",
ANTI_DELETE: process.env.ANTI_DELETE || "true",
ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "inbox",     
};
