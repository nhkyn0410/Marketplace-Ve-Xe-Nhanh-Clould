//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/stop_point_proposal_list_response_dto_output_items_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'stop_point_proposal_list_response_dto_output.g.dart';

/// StopPointProposalListResponseDtoOutput
///
/// Properties:
/// * [items] 
/// * [nextCursor] 
@BuiltValue()
abstract class StopPointProposalListResponseDtoOutput implements Built<StopPointProposalListResponseDtoOutput, StopPointProposalListResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<StopPointProposalListResponseDtoOutputItemsInner> get items;

  @BuiltValueField(wireName: r'nextCursor')
  String? get nextCursor;

  StopPointProposalListResponseDtoOutput._();

  factory StopPointProposalListResponseDtoOutput([void updates(StopPointProposalListResponseDtoOutputBuilder b)]) = _$StopPointProposalListResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(StopPointProposalListResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<StopPointProposalListResponseDtoOutput> get serializer => _$StopPointProposalListResponseDtoOutputSerializer();
}

class _$StopPointProposalListResponseDtoOutputSerializer implements PrimitiveSerializer<StopPointProposalListResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [StopPointProposalListResponseDtoOutput, _$StopPointProposalListResponseDtoOutput];

  @override
  final String wireName = r'StopPointProposalListResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    StopPointProposalListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(StopPointProposalListResponseDtoOutputItemsInner)]),
    );
    yield r'nextCursor';
    yield object.nextCursor == null ? null : serializers.serialize(
      object.nextCursor,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    StopPointProposalListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required StopPointProposalListResponseDtoOutputBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(StopPointProposalListResponseDtoOutputItemsInner)]),
          ) as BuiltList<StopPointProposalListResponseDtoOutputItemsInner>;
          result.items.replace(valueDes);
          break;
        case r'nextCursor':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.nextCursor = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  StopPointProposalListResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = StopPointProposalListResponseDtoOutputBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}


