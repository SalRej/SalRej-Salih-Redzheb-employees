
const inputElement = document.getElementById('input');
inputElement.addEventListener("change", handleFiles, false);
function handleFiles() {

  const fileList = this.files;
  const fileReader = new FileReader();

  fileReader.addEventListener("load", () => {
   const fileText = fileReader.result;
   const fileRows = fileText.split(/\r\n|\n|\r/);

   const rowsData = [];
   for(let i = 0; i < fileRows.length; i++){
    const currentRow = fileRows[i].split(',');
    const endDate = isNaN(Date.parse(currentRow[3]))===true?new Date(): new Date(currentRow[3]);
    rowsData.push([Number(currentRow[0]),Number(currentRow[1]),new Date(currentRow[2]),endDate]);
   }

   const map = new Map();

   for(let i = 0; i < rowsData.length; i++){

        const currentEmployeeId = rowsData[i][0];
        const currentProjectId = rowsData[i][1];
        const currentStartDate = rowsData[i][2]
        const currentEndDate = rowsData[i][3];

        for(let j = 0; j < fileRows.length; j++){

            //looking at the same row
            if(i===j){
                continue;
            }
            
            const employeeIdToCheck = rowsData[j][0];
            const projectIdToCheck = rowsData[j][1];
            const startDateToCheck = rowsData[j][2];
            const endDateToCheck = rowsData[j][3];

            //if looking at the same employee
            if(currentEmployeeId === employeeIdToCheck){
                continue;
            }

            //if looking at diffrent projects
            if(currentProjectId !== projectIdToCheck){
                continue;
            }

            const timeWorked = calculateHours(currentStartDate,currentEndDate,startDateToCheck,endDateToCheck);

            if(map.has(`${currentEmployeeId}-${employeeIdToCheck}`) === false){
                map.set(`${currentEmployeeId}-${employeeIdToCheck}`,{
                    totalTimeInMiliseconds:timeWorked,
                    project:[
                        {
                            timeWorkedOnProject:msToTime(timeWorked),
                            projectId:currentProjectId,
                            idEmployee1:currentEmployeeId,
                            idEmployee2:employeeIdToCheck
                        }
                    ]
                });
            }else{
                const currentRecord = map.get(`${currentEmployeeId}-${employeeIdToCheck}`);
                const currentTime = currentRecord.totalTimeInMiliseconds;
                const currentProject = currentRecord.project;

                currentProject.push({
                    timeWorkedOnProject:msToTime(timeWorked),
                    projectId:currentProjectId,
                    idEmployee1:currentEmployeeId,
                    idEmployee2:employeeIdToCheck
                })

                map.set(`${currentEmployeeId}-${employeeIdToCheck}`,{
                    totalTimeInMiliseconds:currentTime + timeWorked,
                    project:currentProject
                });
            }
        }
   }
   const emplyeesData = getEmplyeesWorkedMost(map);
   appendDataToHtml(emplyeesData);

  }, false);

  fileReader.readAsText(fileList[0]);
}

const calculateHours = (startDate1,endDate1,startDate2,endDate2) => {

    const startDate1Time = startDate1.getTime();
    const endDate1Time = endDate1.getTime();
    const startDate2Time = startDate2.getTime();
    const endDate2Time = endDate2.getTime();

    const start = Math.max(startDate1Time,startDate2Time);
    const end = Math.min(endDate1Time,endDate2Time);

    return end-start;
}

const msToTime = (ms) => {
    let seconds = (ms / 1000).toFixed(1);
    let minutes = (ms / (1000 * 60)).toFixed(1);
    let hours = (ms / (1000 * 60 * 60)).toFixed(1);
    let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
    if (seconds < 60) return seconds + " Sec";
    else if (minutes < 60) return minutes + " Min";
    else if (hours < 24) return hours + " Hrs";
    else return days + " Days"
}

const getEmplyeesWorkedMost = (map) =>{
    let time = Number.NEGATIVE_INFINITY;
    let key = '';
    for (const entry of map.entries()) {
        if(entry[1].totalTimeInMiliseconds>time){
            time = entry[1].totalTimeInMiliseconds;
            key = entry[0];
        }
    }

    return map.get(key);
}

const appendDataToHtml = (data) =>{
    const employee1 = data.project[0].idEmployee1;
    const employee2 = data.project[0].idEmployee2;
    const timeWorked = msToTime(data.totalTimeInMiliseconds);
    const header = document.querySelector('header');
    header.innerHTML='';

    header.append(`Employee ${employee1} and Employee ${employee2} have worked the most, toatal of ${timeWorked}`);

    const table = document.querySelector('table');
    table.innerHTML="";
    table.innerHTML+=`
        <tr>
            <th>Employee ID #1</th>
            <th>Employee ID #2</th>
            <th>Project ID</th>
            <th>Days worked</th>
        </tr>
    `
    data.project.forEach(project=>{
        const row = `
            <tr>
                <td>${project.idEmployee1}</td>
                <td>${project.idEmployee2}</td>
                <td>${project.projectId}</td>
                <td>${project.timeWorkedOnProject}</td>
            </tr>
        `
        table.innerHTML+=row;
    })
}
