import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import tough from 'tough-cookie';

async function loginAndGetResult(rollNo) {
  // Create a new cookie jar for this session
  const jar = new tough.CookieJar();
  const client = wrapper(axios.create({ jar }));

  // Prepare login payload (rollNo is used as email prefix)
  const loginData = {
    "PuniVMenulist": `${rollNo}@rajalakshmi.edu.in`,
    "RoleID": 0
  };
  const loginUrl = 'http://rajalakshmi.in/UI/Modules/Login/UniLogin.aspx/VlidateUser';

  try {
    // Login request
    const loginResponse = await client.post(loginUrl, loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    // The login response data is in the 'd' property as a JSON string
    const loginJson = JSON.parse(loginResponse.data.d);
    const personId = loginJson[0].PersonId;

    // Now fetch exam results using the obtained PersonId
    const resultUrl = 'http://rajalakshmi.in/UI/Modules/UniCurrentResult.aspx/GetResult';
    const resultData = {
      AcademicYearId: 0,
      CourseId: 0,
      SemesterId: 0,
      PersonId: personId
    };

    const resultResponse = await client.post(resultUrl, resultData, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'http://rajalakshmi.in',
        'Referer': 'http://rajalakshmi.in/UI/Modules/uniCurrentResult.aspx?FormHeading=Examination%20Result'
      }
    });

    // Parse the result data (which is stored in the "d" property)
    const resultParsed = JSON.parse(resultResponse.data.d);
    return { rollNo, personId, result: resultParsed };
  } catch (error) {
    return { rollNo, error: error.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { rollNumbers } = req.body;
  if (!rollNumbers || !Array.isArray(rollNumbers)) {
    res.status(400).json({ error: 'rollNumbers must be an array' });
    return;
  }

  // Process each roll number sequentially (or use Promise.all for parallel)
  const results = [];
  for (const roll of rollNumbers) {
    const r = await loginAndGetResult(roll);
    results.push(r);
  }

  res.status(200).json({ results });
}
