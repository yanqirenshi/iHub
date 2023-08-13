import Sogh from 'sogh';

const sogh = new Sogh();

sogh.connect(process.env.REACT_APP_GITHU_PARSONAL_TOKEN);

export default sogh;
