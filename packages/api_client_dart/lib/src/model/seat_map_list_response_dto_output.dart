//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/seat_map_list_response_dto_output_items_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'seat_map_list_response_dto_output.g.dart';

/// SeatMapListResponseDtoOutput
///
/// Properties:
/// * [items] 
/// * [nextCursor] 
@BuiltValue()
abstract class SeatMapListResponseDtoOutput implements Built<SeatMapListResponseDtoOutput, SeatMapListResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<SeatMapListResponseDtoOutputItemsInner> get items;

  @BuiltValueField(wireName: r'nextCursor')
  String? get nextCursor;

  SeatMapListResponseDtoOutput._();

  factory SeatMapListResponseDtoOutput([void updates(SeatMapListResponseDtoOutputBuilder b)]) = _$SeatMapListResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SeatMapListResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SeatMapListResponseDtoOutput> get serializer => _$SeatMapListResponseDtoOutputSerializer();
}

class _$SeatMapListResponseDtoOutputSerializer implements PrimitiveSerializer<SeatMapListResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [SeatMapListResponseDtoOutput, _$SeatMapListResponseDtoOutput];

  @override
  final String wireName = r'SeatMapListResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SeatMapListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(SeatMapListResponseDtoOutputItemsInner)]),
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
    SeatMapListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SeatMapListResponseDtoOutputBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(SeatMapListResponseDtoOutputItemsInner)]),
          ) as BuiltList<SeatMapListResponseDtoOutputItemsInner>;
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
  SeatMapListResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SeatMapListResponseDtoOutputBuilder();
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


