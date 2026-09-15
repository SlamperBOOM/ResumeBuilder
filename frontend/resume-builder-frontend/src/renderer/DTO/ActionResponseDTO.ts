import FrontendActionEnum from '../frontendAction/FrontendActionEnum';

type ActionResponseDTO = {
  frontend_action: FrontendActionEnum;
  payload?: unknown;
};

export default ActionResponseDTO;
