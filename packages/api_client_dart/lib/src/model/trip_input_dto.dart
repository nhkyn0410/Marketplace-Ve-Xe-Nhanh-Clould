//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'trip_input_dto.g.dart';

/// TripInputDto
///
/// Properties:
/// * [routeId] 
/// * [vehicleId] 
/// * [departureAt] 
/// * [arrivalAt] 
/// * [stopTimes] 
/// * [onlineSaleCutoffMinutes] 
/// * [note] 
@BuiltValue()
abstract class TripInputDto implements Built<TripInputDto, TripInputDtoBuilder> {
  @BuiltValueField(wireName: r'routeId')
  String get routeId;

  @BuiltValueField(wireName: r'vehicleId')
  String? get vehicleId;

  @BuiltValueField(wireName: r'departureAt')
  DateTime get departureAt;

  @BuiltValueField(wireName: r'arrivalAt')
  DateTime get arrivalAt;

  @BuiltValueField(wireName: r'stopTimes')
  BuiltList<DateTime>? get stopTimes;

  @BuiltValueField(wireName: r'onlineSaleCutoffMinutes')
  int get onlineSaleCutoffMinutes;

  @BuiltValueField(wireName: r'note')
  String? get note;

  TripInputDto._();

  factory TripInputDto([void updates(TripInputDtoBuilder b)]) = _$TripInputDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(TripInputDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<TripInputDto> get serializer => _$TripInputDtoSerializer();
}

class _$TripInputDtoSerializer implements PrimitiveSerializer<TripInputDto> {
  @override
  final Iterable<Type> types = const [TripInputDto, _$TripInputDto];

  @override
  final String wireName = r'TripInputDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    TripInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'routeId';
    yield serializers.serialize(
      object.routeId,
      specifiedType: const FullType(String),
    );
    yield r'vehicleId';
    yield object.vehicleId == null ? null : serializers.serialize(
      object.vehicleId,
      specifiedType: const FullType.nullable(String),
    );
    yield r'departureAt';
    yield serializers.serialize(
      object.departureAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'arrivalAt';
    yield serializers.serialize(
      object.arrivalAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'stopTimes';
    yield object.stopTimes == null ? null : serializers.serialize(
      object.stopTimes,
      specifiedType: const FullType.nullable(BuiltList, [FullType(DateTime)]),
    );
    yield r'onlineSaleCutoffMinutes';
    yield serializers.serialize(
      object.onlineSaleCutoffMinutes,
      specifiedType: const FullType(int),
    );
    yield r'note';
    yield object.note == null ? null : serializers.serialize(
      object.note,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    TripInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required TripInputDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'routeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.routeId = valueDes;
          break;
        case r'vehicleId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.vehicleId = valueDes;
          break;
        case r'departureAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.departureAt = valueDes;
          break;
        case r'arrivalAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.arrivalAt = valueDes;
          break;
        case r'stopTimes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(BuiltList, [FullType(DateTime)]),
          ) as BuiltList<DateTime>?;
          if (valueDes == null) continue;
          result.stopTimes.replace(valueDes);
          break;
        case r'onlineSaleCutoffMinutes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.onlineSaleCutoffMinutes = valueDes;
          break;
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.note = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  TripInputDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = TripInputDtoBuilder();
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


