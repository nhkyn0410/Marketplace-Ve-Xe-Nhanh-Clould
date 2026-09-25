//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:api_client_dart/src/model/operator_stop_point_list_response_dto_output_items_inner.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'operator_stop_point_list_response_dto_output.g.dart';

/// OperatorStopPointListResponseDtoOutput
///
/// Properties:
/// * [items] 
/// * [nextCursor] 
@BuiltValue()
abstract class OperatorStopPointListResponseDtoOutput implements Built<OperatorStopPointListResponseDtoOutput, OperatorStopPointListResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<OperatorStopPointListResponseDtoOutputItemsInner> get items;

  @BuiltValueField(wireName: r'nextCursor')
  String? get nextCursor;

  OperatorStopPointListResponseDtoOutput._();

  factory OperatorStopPointListResponseDtoOutput([void updates(OperatorStopPointListResponseDtoOutputBuilder b)]) = _$OperatorStopPointListResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OperatorStopPointListResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OperatorStopPointListResponseDtoOutput> get serializer => _$OperatorStopPointListResponseDtoOutputSerializer();
}

class _$OperatorStopPointListResponseDtoOutputSerializer implements PrimitiveSerializer<OperatorStopPointListResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [OperatorStopPointListResponseDtoOutput, _$OperatorStopPointListResponseDtoOutput];

  @override
  final String wireName = r'OperatorStopPointListResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OperatorStopPointListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(OperatorStopPointListResponseDtoOutputItemsInner)]),
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
    OperatorStopPointListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OperatorStopPointListResponseDtoOutputBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(OperatorStopPointListResponseDtoOutputItemsInner)]),
          ) as BuiltList<OperatorStopPointListResponseDtoOutputItemsInner>;
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
  OperatorStopPointListResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OperatorStopPointListResponseDtoOutputBuilder();
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


