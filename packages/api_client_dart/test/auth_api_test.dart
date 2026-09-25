import 'package:test/test.dart';
import 'package:api_client_dart/api_client_dart.dart';


/// tests for AuthApi
void main() {
  final instance = ApiClientDart().getAuthApi();

  group(AuthApi, () {
    //Future<MessageResponseDtoOutput> authControllerChangeRequiredPassword(PasswordChangeRequiredDto passwordChangeRequiredDto) async
    test('test authControllerChangeRequiredPassword', () async {
      // TODO
    });

    //Future<MessageResponseDtoOutput> authControllerLogout() async
    test('test authControllerLogout', () async {
      // TODO
    });

    //Future<OAuthRedirectResponseDtoOutput> authControllerOauth(String provider, OAuthInitDto oAuthInitDto) async
    test('test authControllerOauth', () async {
      // TODO
    });

    //Future<AuthTokenResponseDtoOutput> authControllerOauthSession() async
    test('test authControllerOauthSession', () async {
      // TODO
    });

    //Future<CredentialLoginResponseDtoOutput> authControllerOperatorLogin(CredentialLoginDto credentialLoginDto) async
    test('test authControllerOperatorLogin', () async {
      // TODO
    });

    //Future<CredentialLoginResponseDtoOutput> authControllerPlatformLogin(CredentialLoginDto credentialLoginDto) async
    test('test authControllerPlatformLogin', () async {
      // TODO
    });

    //Future<MessageResponseDtoOutput> authControllerReauth(ReauthDto reauthDto) async
    test('test authControllerReauth', () async {
      // TODO
    });

    //Future<AuthTokenResponseDtoOutput> authControllerRefresh(RefreshTokenDto refreshTokenDto) async
    test('test authControllerRefresh', () async {
      // TODO
    });

    //Future<MessageResponseDtoOutput> authControllerRegister(RegisterDto registerDto) async
    test('test authControllerRegister', () async {
      // TODO
    });

    //Future<MessageResponseDtoOutput> authControllerRequestOtp(OtpRequestDto otpRequestDto) async
    test('test authControllerRequestOtp', () async {
      // TODO
    });

    //Future<MfaVerifyResponseDtoOutput> authControllerVerifyMfa(MfaVerifyDto mfaVerifyDto) async
    test('test authControllerVerifyMfa', () async {
      // TODO
    });

    //Future<AuthTokenResponseDtoOutput> authControllerVerifyOtp(OtpVerifyDto otpVerifyDto) async
    test('test authControllerVerifyOtp', () async {
      // TODO
    });

    //Future<SessionListResponseDtoOutput> sessionControllerList({ String cursor, int limit }) async
    test('test sessionControllerList', () async {
      // TODO
    });

    //Future sessionControllerRevoke(String sessionId) async
    test('test sessionControllerRevoke', () async {
      // TODO
    });

  });
}
