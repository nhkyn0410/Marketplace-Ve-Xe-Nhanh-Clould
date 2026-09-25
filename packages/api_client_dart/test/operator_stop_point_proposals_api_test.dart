import 'package:test/test.dart';
import 'package:api_client_dart/api_client_dart.dart';


/// tests for OperatorStopPointProposalsApi
void main() {
  final instance = ApiClientDart().getOperatorStopPointProposalsApi();

  group(OperatorStopPointProposalsApi, () {
    //Future<StopPointProposalResponseDtoOutput> stopPointProposalControllerCreate(StopPointProposalInputDto stopPointProposalInputDto) async
    test('test stopPointProposalControllerCreate', () async {
      // TODO
    });

    //Future<StopPointProposalListResponseDtoOutput> stopPointProposalControllerList({ String status, String cursor, num limit }) async
    test('test stopPointProposalControllerList', () async {
      // TODO
    });

    //Future<StopPointProposalResponseDtoOutput> stopPointProposalControllerResubmit(String proposalId, StopPointProposalInputDto stopPointProposalInputDto) async
    test('test stopPointProposalControllerResubmit', () async {
      // TODO
    });

  });
}
